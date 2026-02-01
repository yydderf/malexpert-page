import { get } from "svelte/store";
import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { type SelectionState } from "$lib/stores/pipeline.ts";
import { type PipelineStageName } from "$lib/consts/pipeline.ts";
import { API_BASE, API_ROUTES, EVENTS } from "$lib/consts/api.ts";

type AnalyzerResult  = string;
type EncoderResult   = string;
type ExpanderResult  = string;
type AugmentorResult = string;
type DetectorResult  = string;
type ExplainerResult = string;
type AnalysisResult  = AnalyzerResult | EncoderResult | ExpanderResult | AugmentorResult | DetectorResult | ExplainerResult;

type RunnerResp = {
    job_id?: string;
    results?: Partial<Record<PipelineStageName, AnalysisResult>>;
};

type RunnerState = {
    job_id: string;
    status: "";
    progress: number;
    stage: string;
    message: string;
    results: Record<PipelineStageName, AnalysisResult>;
};

type RunnerPayload = {
    stages: {
        stage: PipelineStageName;
        model: string;
        params: Record<string, unknown>;
    }[];
};

function toRunnerPayload(state: SelectionState): RunnerPayload {
    return {
        stages: state.map(({ stage, selection }) => ({
            stage,
            model: selection.model?.val ?? selection.model.default,
            params: Object.fromEntries(
                Object.entries(selection.params)
                    .filter(([, p]) => p.val !== null)
                    .map(([k, p]) => [k, p.val])
            ),
        })),
    };
}

function createRunner() {
    const base = createBaseFetchStore<RunnerState>({
        job_id: "",
        status: "not-started",
        progress: 0.0,
        stage: "",
        message: "",
        results: {},
    });

    let es: EventSource | null = null;
    let subs = 0;

    function disconnect() {
        if (es) {
            es.close();
            es = null;
        }
    }

    function connect(job_id: string) {
        if (!job_id) {
            return;
        }
        if (subs === 0) {
            base._store.update((s) => ({ ...s, job_id, status: "running" }));
            return;
        }

        disconnect();
        const url = `${API_BASE}${API_ROUTES.JOBS.EVENTS(job_id)}`;
        es = new EventSource(url);

        base._store.update((s) => ({ ...s, job_id, status: "running"}));

        const onStageMessage = (e: Event) => {
            const msg = JSON.parse((e as MessageEvent).data);
            base._store.update((s) => ({
                ...s,
                stage: msg?.fields?.stage ?? s.stage,
                progress: (msg?.fields?.pct ?? null) != null ? Number(msg.fields.pct) : s.progress,
                message: msg?.fields?.msg ?? s.message,
            }));
        }

        es.addEventListener(EVENTS.NAME.CREATED, () => {
        });

        es.addEventListener(EVENTS.NAME.RUNNING, () => {
        });

        es.addEventListener(EVENTS.NAME.STAGE_START, onStageMessage);

        es.addEventListener(EVENTS.NAME.STAGE_DONE, onStageMessage);

        es.addEventListener(EVENTS.NAME.HALTED, () => {
        });

        es.addEventListener(EVENTS.NAME.ERROR, (e) => {
            base._store.update((s) => ({ ...s, status: "error", message: "stream error" }));
        });

        es.addEventListener(EVENTS.NAME.DONE, (e) => {
            const msg = JSON.parse((e as MessageEvent).data);
            base._store.update((s) => ({
                ...s,
                status: "done",
                results: msg?.results ?? s.results,
            }));
            disconnect();
        });

        es.addEventListener(EVENTS.NAME.ENDED, () => {
        });
    }

    async function registerJob(sample_id: string, user_selections: SelectionState): Promise<string> {
        const st = base._get();
        if (user_selections.length === 0) {
            return "";
        }

        const key = "runner" as const;

        return base._runOnce(key, async() => {
            const url = `${API_BASE}${API_ROUTES.SAMPLES.RUN(sample_id)}`;
            const body = toRunnerPayload(get(user_selections))
            const data = await base._requestJson<RunnerResp, RunnerPayload>(url, { method: "POST", body });
            connect(data?.job_id ?? "");
            return data?.job_id ?? "";
            // return base._requestJson<RunnerResp, RunnerPayload>(url, { method: "POST", body });
        });

        // await base._runOnce(key, async() => {
        //     const url = `${API_BASE}${API_ROUTES.SAMPLES.ANALYZE(sample_id)}`;
        //     return base._requestJson<{}, RunnerPayload>(url, method="POST", body=toRunnerPayload(user_selections));
        // });
    }

    return {
        // subscribe: base._store.subscribe,
        subscribe(run: (v: RunnerState) => void) {
            subs += 1;

            let job_id_snapshot = "";
            const unsub = base._store.subscribe((v) => {
                job_id_snapshot = v.job_id;
                run(v);
            });

            if (subs === 1) {
                if (job_id_snapshot && !es) connect(job_id_snapshot);
            }

            return () => {
                subs -= 1;
                unsub();
                if (subs === 0) disconnect();
            }
        },
        registerJob,
        connect,
        disconnect,
    };
}

export const runner = createRunner();
