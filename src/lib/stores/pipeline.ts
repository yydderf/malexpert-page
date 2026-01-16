import { writable, derived, get } from "svelte/store";
import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { API_BASE, API_ROUTES } from "$lib/consts/api.ts";
import { STAGE_ORDER, type PipelineStageName } from "$lib/consts/pipeline.ts";

type ModelInfo = { name: string; help: string };
type ParamSpec = { type: string; default: unknown };
type StageInfo = { name: PipelineStageName, help: string };

export type PipelineStage = {
    models: ModelInfo[];
    params: Record<string, ParamSpec>;
    description: string;
    next: string[];
};
type CatalogState = {
    stages: Partial<Record<PipelineStageName, PipelineStage>>;
    version: string;
};
type CatalogResp = {
    stages?: Record<string, Partial<PipelineStage>>;
    version?: string;
};

type StageSelection = {
    model: string;
    params: Record<string, unknown>;
};
type SelectionItem = { stage: PipelineStageName, selection: StageSelection };
type SelectionState = SelectionItem[];
type EffectiveState = Record<PipelineStageName, StageSelection>;

export type StageInfoList = StageInfo[]; // .next_stage
export type ModelInfoList = ModelInfo[]; // .models
export type ParamSpecRec  = Record<string, ParamSpec>; // .params

// result[stage_name].next_stage -> list
// result[stage_name].models -> list

// model specific params
// result[stage_name].model[model_name].params -> list
// type ModelParamRecVal = { params: ParamSpecList };
// type ModelParamRec = Record<string, ModelParamRecVal>;

type StageRecVal = {
    models: ModelInfoList,
    params: ParamSpecRec,
    // model: ModelParamRec, -> for model specific params
};
export type StageRec = Record<PipelineStageName, StageRecVal>;

function createPipeline() {
    const base = createBaseFetchStore<CatalogState>({
        stages: {},
        version: "",
    });

    const user_selections = writable<SelectionState>([
        { stage: STAGE_ORDER.at(0) ?? "analyzer", selection: { model: "", params: {} } },
    ]);

    const last_stage = derived(user_selections, ($sel) => {
        return $sel.at(-1) ?? { stage: "", selection: { model: "", params: {} } };
    });

    const ready = derived(base._store, ($s) => {
        const has_stages = Object.keys($s.stages).length > 0;
        return Boolean(has_stages);
    });

    const descriptions = derived(base._store, ($s) => 
        Object.fromEntries(
            Object.entries($s.stages).map(([stage, info]) => [
                stage, info.description
            ])
        ) as Partial<Record<PipelineStageName, string>>
    );

    const catalog = derived(base._store, ($s) => {
        return { stages: $s.stages, version: $s.version } as CatalogState;
    });

    const allowedStages: Readable<(index: number | null) => PipelineStageName[]> = derived([catalog, user_selections], ([$c, $sel]) => {
        return (index: number | null) => {
            if (!$c) return [];

            if (index === 0 || $sel.length === 0) {
                return [STAGE_ORDER.at(0) ?? "analyze"];
            }

            if (index == null) {
                const last_stage = $sel.at(-1)?.stage;
                return last_stage ? ($c.stages[last_stage]?.next ?? []) : [];
            }

            const prev_stage = $sel[index - 1]?.stage;
            return prev_stage ? ($c.stages[prev_stage]?.next ?? []) : [];
        };
    });

    /*
    catalog response:
    {
      "stages": {
        "analyzer": { "models": [...], "params": {...}, "description": "..."},
        "encoder":  { "models": [...], "params": {...}, "description": "..."},
        ...
      },
      "version": "..."
    }
    */
    async function fetchCatalog({ force = false }: { force?: boolean } = {}
    ): Promise<{ stages: CatalogState["stages"]; version: string }> {
        const st = base._get();
        if (!force && Object.keys(st.stages).length > 0 && st.version) {
            return { stages: st.stages, version: st.version };
        }

        const key = "catalog" as const;

        return base._runOnce(key, async () => {
            const url = `${API_BASE}${API_ROUTES.PIPELINE.CATALOG}`;
            const data = await base._fetchJson<CatalogResp>(url);

            base._store.update((s) => {
                const updated_stages: CatalogState["stages"] = { ...s.stages };

                for (const [stage, info] of Object.entries(data.stages ?? {})) {
                    const prev = updated_stages[stage] ?? { models: [], params: {}, description: "", next: [] };
                    updated_stages[stage] = {
                        models: info.models ?? prev.models,
                        params: info.params ?? prev.params,
                        description: info.description ?? prev.description,
                        next: info.next ?? prev.next,
                    };
                }

                return { ...s, stages: updated_stages, version: data.version ?? s.version };
            });

            const updated = base._get();
            return { stages: updated.stages, version: updated.version };
        });
    }

    function setNextStage(stage: PipelineStageName) {
        user_selections.update((s) => [
            ...(s ?? []),
            { stage, selection: { model: "", params: {} } },
        ]);
    }

    function setModel(stage: PipelineStageName, model: string) {
        user_selections.update((s) => {
            const arr = s ?? [];
            const idx = arr.findIndex(x => x.stage === stage);
            if (idx === -1) return arr;

            const updated = arr.slice();
            updated[idx] = {
                ...updated[idx],
                selection: { ...updated[idx].selection, model },
            }
            return updated;
        });
    }

    function setParam(stage: PipelineStageName, key: string, value: unknown) {
        user_selections.update((s) => {
            const arr = s ?? [];
            const idx = arr.findIndex(x => x.stage === stage);
            if (idx === -1) return arr;

            const updated = arr.slice();
            updated[idx] = {
                ...updated[idx],
                selection: {
                    ...updated[idx].selection,
                    params: {
                        ...updated[idx].selection.params,
                        [key]: val,
                    }
                }
            }
            return updated;
        });
    }

    function getModels(stage: PipelineStageName): ModelInfo [] {
        return get(base._store).stages[stage]?.models ?? [];
    }

    function getParams(stage: PipelineStageName): Record<string, ParamSpec> {
        return get(base._store).stages[stage]?.params ?? {};
    }

    // function catalog(): CatalogState {
    //     const { stages, version } = base._get();
    //     return { stages, version };
    // }

    return {
        subscribe: base._store.subscribe,
        fetchCatalog,
        setNextStage,
        setModel,
        setParam,
        getModels,
        getParams,

        user_selections,
        descriptions,
        ready,
        last_stage,
        allowedStages,

        catalog,

        get error() {
            return base._get().error;
        },
        get loading() {
            return base._get().loading;
        },
        get version() {
            return base._get().version;
        },
    };
}

export const pipeline = createPipeline();
