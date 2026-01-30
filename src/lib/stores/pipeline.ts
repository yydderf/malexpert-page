import { writable, derived, get, type Writable } from "svelte/store";
import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { API_BASE, API_ROUTES } from "$lib/consts/api.ts";
import {
    STAGE_ORDER, EDITOR, DEFAULT,
    type PipelineStageName, type EditorStep,
    type ModelInfo, type ParamSpec, type StageInfo,
} from "$lib/consts/pipeline.ts";

export type PipelineStage = {
    models: ModelInfo[];
    params: Record<string, ParamSpec>;
    description: string;
    next: string[];
    default: string;
};
type CatalogState = {
    stages: Partial<Record<PipelineStageName, PipelineStage>>;
    version: string;
};
type CatalogResp = {
    stages?: Record<string, Partial<PipelineStage>>;
    version?: string;
};

type StageInfoList = StageInfo[]; // .next_stage
type ModelInfoList = ModelInfo[]; // .models
type ParamSpecRec  = Record<string, ParamSpec>; // .params

type EditorTarget = { kind: EDITOR.KINDS.APPEND } | { kind: EDITOR.KINDS.EDIT; index: number };
type EditorState = {
    open: boolean;
    target: EditorTarget | null;
    step: EditorStep;
}

type StageSelection = {
    model: { val: string | null, default: string }
    params: Record<string, { val: unknown | null, default: unknown }>;
};
export type SelectionItem = { stage: PipelineStageName, selection: StageSelection, touched?: boolean, last_step?: EditorStep };
export type SelectionState = SelectionItem[];

function createEditor() {
    const store: Writable<EditorState> = writable({
        open: false,
        target: null,
        step: EDITOR.STEPS.STAGE,
    });
    
    function openEditor(target: EditorTarget, step: step = EDITOR.STEPS.STAGE) {
        store.set({ open: true, target, step });
    }

    function closeEditor() {
        store.set({ open: false, target: null, step: EDITOR.STEPS.STAGE });
    }

    function setTarget(target: EditorTarget) {
        store.update((e) => ({ ...e, target }));
    }

    function setStep(step: EditorStep) {
        store.update((e) => ({ ...e, step }));
    }

    return {
        subscribe: store.subscribe,
        openEditor,
        closeEditor,
        setStep,
        setTarget,
    };
}

function createPipeline() {
    const base = createBaseFetchStore<CatalogState>({
        stages: {},
        version: "",
    });

    const user_selections = writable<SelectionState>([]);

    const last_stage = derived(user_selections, ($sel) => {
        return $sel.at(-1) ?? { stage: "", selection: { model: "", params: {}, touched: false, last_step: EDITOR.STEPS.STAGE } };
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

    const allowedStages: Readable<(index: number | null) => PipelineStageName[]> = derived([catalog, user_selections, last_stage], ([$c, $sel, $l]) => {
        return (index: number | null) => {
            if (!$c) return [];

            if (index === 0 || $sel.length === 0) {
                return [STAGE_ORDER.at(0) ?? "analyze"];
            }

            if (index == null) {
                return $l ? ($c.stages[$l.stage]?.next ?? []) : [];
            }

            const prev_stage = $sel[index - 1]?.stage;
            return prev_stage ? ($c.stages[prev_stage]?.next ?? []) : [];
        };
    });


    function setNextStage(stage: PipelineStageName) {
        const st = base._get();
        const stage_info = st.stages?.[stage];
        if (!stage_info) return;

        const stage_default_params = Object.fromEntries(
            Object.entries(stage_info.params ?? {}).map(([param, spec]) => [
                param, { val: null, default: spec?.default ?? null },
            ])
        );

        user_selections.update((s) => [
            ...s,
            { 
                stage,
                selection: {
                    model: { val: null, default: stage_info.default ?? "" },
                    params: {
                        ...stage_default_params,
                        // [DEFAULT.PARAM.HIDE_STAGE_OUTPUT]: { val: null, default: false },
                    },
                    touched: false,
                    last_step: EDITOR.STEPS.MODEL
                },
            },
        ]);
    }

    function setStage(index: number, stage: PipelineStageName, force: boolean = false) {
        const st = base._get();
        const stage_info = st.stages?.[stage];
        if (!stage_info) return;

        const stage_default_params = Object.fromEntries(
            Object.entries(stage_info.params ?? {}).map(([param, spec]) => [
                param, { val: null, default: spec?.default ?? null },
            ])
        );

        user_selections.update((s) => {
            if (!s[index] || (s[index].stage === stage && !force)) return s;
            // const updated = s.slice(0, index + 1);
            // s[index].stage === stage && force -> reset params 
            const updated = (s[index].stage === stage && force) ? s.slice() : s.slice(0, index + 1);;
            updated[index] = {
                ...updated[index],
                stage,
                selection: {
                    model: { val: null, default: stage_info.default ?? "" },
                    params: {
                        ...stage_default_params,
                        // [DEFAULT.PARAM.HIDE_STAGE_OUTPUT]: { val: null, default: false },
                    },
                    touched: false,
                    last_step: EDITOR.STEPS.MODEL,
                },
            };
            return updated;
        });
    }

    function setTouched(index: number) {
        user_selections.update((s) => {
            if (!s[index]) return s;
            const updated = s.slice();
            updated[index] = { ...updated[index], touched: true };
            return updated;
        });
    }

    function setLastStep(index: number, step: EditorStep) {
        user_selections.update((s) => {
            if (!s[index]) return s;
            const updated = s.slice();
            updated[index] = {
                ...updated[index],
                selection: {
                    ...updated[index].selection,
                    last_step: step,
                },
            };
            return updated;
        });
    }

    function setModel(index: number, model: string) {
        user_selections.update((s) => {
            if (!s[index]) return s;
            const updated = s.slice();
            updated[index] = {
                ...updated[index],
                selection: {
                    model: {
                        ...updated[index].selection.model,
                        val: model,
                    },
                    last_step: EDITOR.STEPS.PARAM,
                },
            };
            return updated;
        });
        setTouched(index);
    }

    function setParam(index: number, key: string, value: unknown) {
        user_selections.update((s) => {
            if (!s[index]) return s;
            const updated = s.slice();
            updated[index] = {
                ...updated[index],
                selection: {
                    ...updated[index].selection,
                    params: {
                        ...updated[index].selection.params,
                        [key]: value,
                    }
                }
            }
            return updated;
        });
    }

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

        const retval = await base._runOnce(key, async () => {
            const url = `${API_BASE}${API_ROUTES.PIPELINE.CATALOG}`;
            let data: CatalogResp;
            try {
                data = await base._requestJson<CatalogResp>(url);
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Unknown error while fetching catalog";
                throw new Error(`${url}: ${msg}`);
            }

            base._store.update((s) => {
                const updated_stages: CatalogState["stages"] = { ...s.stages };

                for (const [stage, info] of Object.entries(data.stages ?? {})) {
                    const prev = updated_stages[stage] ?? { models: [], params: {}, description: "", next: [] };
                    updated_stages[stage] = {
                        models: info.models ?? prev.models,
                        params: info.params ?? prev.params,
                        description: info.description ?? prev.description,
                        next: info.next ?? prev.next,
                        default: info.default ?? prev.default,
                    };
                }

                return { ...s, stages: updated_stages, version: data.version ?? s.version };
            });

            if (get(user_selections).length === 0) {
                setNextStage(STAGE_ORDER.at(0) ?? "analyzer");
            }

            const updated = base._get();
            return { stages: updated.stages, version: updated.version };
        });

        return retval;
    }

    function getModels(stage: PipelineStageName): ModelInfo [] {
        return get(base._store).stages[stage]?.models ?? [];
    }

    function getParams(stage: PipelineStageName): Record<string, ParamSpec> {
        return get(base._store).stages[stage]?.params ?? {};
    }

    return {
        subscribe: base._store.subscribe,
        fetchCatalog,

        setNextStage,
        setStage,
        setModel,
        setParam,
        setTouched,
        setLastStep,

        getModels,
        getParams,

        allowedStages,

        user_selections,
        descriptions,
        ready,
        last_stage,

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
export const editor = createEditor();
