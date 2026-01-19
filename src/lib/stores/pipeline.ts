import { writable, derived, get, type Writable } from "svelte/store";
import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { API_BASE, API_ROUTES } from "$lib/consts/api.ts";
import {
    STAGE_ORDER, EDITOR,
    type PipelineStageName, type EditorStep,
} from "$lib/consts/pipeline.ts";

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
    model: string;
    params: Record<string, unknown>;
};
type SelectionItem = { stage: PipelineStageName, selection: StageSelection, touched?: boolean, last_step?: EditorStep };
type SelectionState = SelectionItem[];

function createEditor() {
    const store: Writable<EditorState> = writable({
        open: false,
        target: null,
        step: EDITOR.STEPS.STAGE,
    });
    
    function openEditor(target: EditorTarget) {
        store.set({ open: true, target, step: EDITOR.STEPS.STAGE });
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

    const user_selections = writable<SelectionState>([
        {
            stage: STAGE_ORDER.at(0) ?? "analyzer", 
            selection: { model: "", params: {}, touched: false, last_step: EDITOR.STEPS.MODEL }
        },
    ]);

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
            { stage, selection: { model: "", params: {}, touched: false, last_step: EDITOR.STEPS.MODEL } },
        ]);
    }

    function setTouched(index: number) {
        user_selections.update((s) => {
            if (!s[index]) return s;
            const updated = s.slice();
            updated[index] = { ...updated[index], touched: true };
            return updated;
        });
    }

    function setStage(index: number, stage: PipelineStageName) {
        user_selections.update((s) => {
            if (!s[index] || s[index].stage === stage) return s;
            const updated = s.slice(0, index + 1);
            updated[index] = {
                ...updated[index],
                stage,
                selection: {
                    model: "",
                    params: {},
                    touched: false,
                    last_step: EDITOR.STEPS.MODEL,
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
                    ...updated[index].selection,
                    model,
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

    return {
        subscribe: base._store.subscribe,
        fetchCatalog,

        setNextStage,
        setStage,
        setModel,
        setParam,
        setTouched,

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
