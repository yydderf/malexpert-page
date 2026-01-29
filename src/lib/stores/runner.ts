import { get } from "svelte/store";
import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { type SelectionState } from "$lib/stores/pipeline.ts";
import { type PipelineStageName } from "$lib/consts/pipeline.ts";
import { API_BASE, API_ROUTES } from "$lib/consts/api.ts";

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
        results: {},
    });

    async function registerJob(sample_id: string, user_selections: SelectionState): Promise<{}> {
        const st = base._get();
        if (user_selections.length === 0) {
            return {};
        }

        const key = "runner" as const;

        return base._runOnce(key, async() => {
            const url = `${API_BASE}${API_ROUTES.SAMPLES.RUN(sample_id)}`;
            const body = toRunnerPayload(get(user_selections))
            return base._requestJson<RunnerResp, RunnerPayload>(url, { method: "POST", body });
        });

        // await base._runOnce(key, async() => {
        //     const url = `${API_BASE}${API_ROUTES.SAMPLES.ANALYZE(sample_id)}`;
        //     return base._requestJson<{}, RunnerPayload>(url, method="POST", body=toRunnerPayload(user_selections));
        // });
    }

    return {
        subscribe: base._store.subscribe,
        registerJob,
    };
}

export const runner = createRunner();
