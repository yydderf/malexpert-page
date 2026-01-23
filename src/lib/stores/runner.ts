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
    results?: Partial<Record<PipelineStageName, AnalysisResult>>;
};

type RunnerState = {
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

    async function registerJob(sample_id: string, user_selections: SelectionState): Promise<{ results: Record<string, AnalysisResult> }> {
        const st = base._get();
        if (user_selections.length === 0) {
            return { results: {} };
        }

        const key = "runner" as const;
        const retval = await base._runOnce(key, async() => {
            const url = `${API_BASE}${API_ROUTES.SAMPLES.ANALYZE(sample_id)}`;
            const data = await base._requestJson<RunnerResp, RunnerPayload>(url, method="POST", body=toRunnerPayload(user_selections));
            return { results: {} };
        });

        return ret_val;
    }

    return {
        subscribe: base._store.subscribe,
        registerJob,
    };
}

export const runner = createRunner();
