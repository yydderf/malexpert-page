import { writable, derived, get } from "svelte/store";
import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { API_BASE, API_ROUTES } from "$lib/consts/api.ts";
import { STAGE_ORDER, type PipelineStageName } from "$lib/consts/pipeline.ts";

type ModelInfo = { name: string; help: string };
type ParamSpec = { type: string; default: unknown };

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

// for Dialog.svelte and Pipeline.svelte
export type PageSelectionUnit = { stage: PipelineStageName, description: string };
export type PageSelectionList = PageSelectionUnit[];
export type PageSelection = Record<PipelineStageName, PageSelectionList>;

function createPipeline() {
    const base = createBaseFetchStore<CatalogState>({
        stages: {},
        version: "",
    });
    const selections = writable<SelectionState>([
        { stage: STAGE_ORDER.at(0) ?? "analyzer", selection: { model: "", params: {} } },
    ]);

    const last_stage = derived(selections, ($sel) => {
        return $sel.at(-1) ?? { stage: "", selection: { model: "", params: {} } };
    });

    const ready = derived(base._store, ($s) => {
        const has_stages = Object.keys($s.stages).length > 0;
        return Boolean(has_stages);
    });

    // const effective = derived([base._store, selections], ([$s, $sel]): EffectiveState => {
    //     const out = {} as EffectiveState;
    //     for (const stage of STAGE_ORDER) {
    //         const stage_info = $s.stages[stage];
    //         const stage_models = stage_info?.models ?? []; // fallback should not happen
    //         const stage_params = stage_info?.params ?? {};

    //         const defaults: Record<string, unknown> = {};
    //         for (const [k, spec] of Object.entries(stage_params)) defaults[k] = spec.default;

    //         const default_model = typeof defaults[stage] === "string" ? (defaults[stage] as string) : "";
    //         const selected_model = $sel[stage]?.model || default_model;

    //         const merged_params = {
    //             ...defaults,
    //             ...($sel[stage]?.params ?? {}),
    //             [stage]: selected_model,
    //         };

    //         out[stage] = { model: selected_model, params: merged_params };
    //     }
    //     return out;
    // });

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
        selections.update((s) => [
            ...(s ?? []),
            { stage, selection: { model: "", params: {} } },
        ]);
    }

    function setModel(stage: PipelineStageName, model: string) {
        selections.update((s) => {
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
        selections.update((s) => {
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

    function models(stage: PipelineStageName): ModelInfo [] {
        return get(base._store).stages[stage]?.models ?? [];
    }

    function params(stage: PipelineStageName): Record<string, ParamSpec> {
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

        selections,
        descriptions,
        ready,
        last_stage,

        models,
        params,
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
