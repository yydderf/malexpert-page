import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { API_BASE, API_ROUTES } from "$lib/consts/api.ts";
import { PipelineStageName } from "$lib/consts/pipeline.ts";

// pub struct ModelInfo { pub name: String, pub help: String }
// #[serde(tag = "type")]
// pub enum ParamSpec {
//     #[serde(rename = "int")] // "type": "Int" -> "type": "int"
//     Int { default: i64 },...}
type ModelInfo = { name: string; help: string };
type ParamSpec = { type: string; default: unknown };

// pub struct PipelineStage {
//     pub models: Vec<ModelInfo>,
//     pub params: HashMap<String, ParamSpec>,
//     pub description: String
// }
// pub struct Catalog {
//     pub stages: HashMap<String, PipelineStage>,
//     pub version: String,
// }
type PipelineStage = {
    models: ModelInfo[];
    params: Record<string, ParamSpec>;
    description: string;
};
type CatalogState = {
    stages: Record<PipelineStageName, PipelineStage>;
    version: string;
};
type CatalogResp = {
    stages?: Record<string, Partial<PipelineStage>>;
    version?: string;
};


function createPipeline() {
    const base = createBaseFetchStore<CatalogState>({
        stages: {},
        version: "",
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
                const next_stages: CatalogState["stages"] = { ...s.stages };

                for (const [stage, info] of Object.entries(data.stages ?? {})) {
                    const prev = next_stages[stage] ?? { models: [], params: {}, description: "" };
                    next_stages[stage] = {
                        models: info.models ?? prev.models,
                        params: info.params ?? prev.params,
                        description: info.description ?? prev.description,
                    };
                }

                return { ...s, stages: next_stages, version: data.version ?? s.version };
            });

            const next = base._get();
            return { stages: next.stages, version: next.version };
        });
    }

    return {
        subscribe: base.subscribe,
        fetchCatalog,

        get catalog(): CatalogState {
            const { stages, version } = base._get();
            return { stages, version };
        },
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

// def run_pipeline(args):
//     return (
//         InitStage(args)
//         .analyze()
//         .encode()
//         .expand()
//         .augment()
//         .detect()
//         .explain()
//      )
