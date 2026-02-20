import { get } from "svelte/store";
import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { type SelectionState } from "$lib/stores/pipeline.ts";
import { type PipelineStageName } from "$lib/consts/pipeline.ts";
import { API_BASE, API_ROUTES, EVENTS } from "$lib/consts/api.ts";
import type { RunnerState, AnalysisResult } from "$lib/consts/api.ts";
import { toast } from "svelte-sonner";

type RunnerResp = {
    job_id?: string;
};

type RunnerState = {
    job_id: string;
    status: RunnerStatus;
    progress: number;
    stage: string;
    message: string;
    results: AnalysisResult[];
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
    // the data structure is too mixed up
    // should split the work load into other stores
    const base = createBaseFetchStore<RunnerState>({
        job_id: "",
        status: EVENTS.STATUS.NOT_STARTED,
        progress: 0.0,
        stage: "",
        message: "",
        results: [],
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
            base._store.update((s) => ({ ...s, job_id, status: EVENTS.STATUS.RUNNING }));
            return;
        }

        disconnect();
        const url = `${API_BASE}${API_ROUTES.JOBS.EVENTS(job_id, EVENTS.TYPES.PROGRESS)}`;

        es = new EventSource(url);

        base._store.update((s) => ({ ...s, job_id, status: EVENTS.STATUS.RUNNING }));

        // const onStageMessage = (e: Event) => {
        const onStageMessage = (msg: any) => {
            base._store.update((s) => ({
                ...s,
                stage: msg?.stage ?? s.stage,
                progress: (msg?.pct ?? null) != null ? Number(msg.pct) : s.progress,
                message: msg?.msg ?? s.message,
            }));
        }

        es.addEventListener(EVENTS.NAME.CREATED, () => {});
        es.addEventListener(EVENTS.NAME.RUNNING, () => {});

        es.addEventListener(EVENTS.NAME.STAGE_START, (e) => {
            const msg = JSON.parse((e as MessageEvent).data);
            onStageMessage(msg);
        });
        es.addEventListener(EVENTS.NAME.STAGE_DONE, (e) => {
            const msg = JSON.parse((e as MessageEvent).data);
            onStageMessage(msg);

            const stage = msg?.stage as string;
            let inserted_index = -1;

            base._store.update((s) => {
                inserted_index = s.results.length;
                return {
                    ...s,
                    results: [...s.results, { stage: "", result: null as unknown as StageResult }],
                };
            });

            const url = `${API_BASE}${API_ROUTES.JOBS.RESULTS(get(base).job_id, stage)}`;
            (async () => {
                const result_resp = await base._requestJson(url);
                base._store.update((s) => {
                    if (inserted_index < 0 || inserted_index >= s?.results.length) return s;
                    const results = s.results.slice();
                    results[inserted_index] = { stage: result_resp.stage, result: result_resp.result };
                    return { ...s, results };
                });
            })().catch((err) => {
                toast.error(`Failed at fetching the ${stage}'s result`);
            });

            // TODO: fetch temporal graph data for that stage
            // const tg_url = `${API_BASE}${API_ROUTES.JOBS.TEMP_GRAPH(get(base).job_id, stage)}`;
            // (async () => {
            //     const temp_graph_resp = await base._requestJSON(tg_url);
            //     base._store.update((s) => {
            //         if (inserted_index < 0 || inserted_index >= s?.results.length) return s;
            //         const temp_graphs = s.results.slice();
            //         results[inserted_index] = { stage: result_resp.stage, result: result_resp.result };
            //         return { ...s, results };
            //     });
            // })().catch((err) => {
            //     toast.error(`Failed at fetching the ${stage}'s temporal graph`);
            // });
        });

        es.addEventListener(EVENTS.NAME.HALTED, () => {});
        es.addEventListener(EVENTS.NAME.ERROR, (e) => {
            toast.error(`Failed at stage: ${get(base)?.stage ?? "internal error"}`);
            base._store.update((s) => ({ ...s, status: EVENTS.STATUS.ERROR, message: "stream error" }));
        });

        es.addEventListener(EVENTS.NAME.DONE, (e) => {
            toast.info(`Analysis successfully ended`);
            const msg = JSON.parse((e as MessageEvent).data);
            base._store.update((s) => ({
                ...s,
                status: EVENTS.STATUS.DONE,
                // results: msg?.results ?? s.results,
            }));
            disconnect();
        });

        // es.addEventListener(EVENTS.NAME.ENDED, () => {});
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
        });
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
