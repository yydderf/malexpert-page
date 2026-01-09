import { createBaseFetchStore } from "$lib/stores/base_fetch.js";
import { API_BASE, API_ROUTES } from "$lib/consts/api.js";

function createPipeline() {
    const base = createBaseFetchStore({
        models: new Map(),
        params: new Map(),
    });

    function _key(kind, stage) {
        return `${kind}:${stage}`;
    }

    async function fetchModels(stage, { force = false } = {}) {
        if (!stage) throw new Error("missing stage");

        const st = base._get();
        if (!force && st.models.has(stage)) return st.models.get(stage);

        const key = _key("models", stage);

        return base._runOnce(key, async () => {
            const url = `${API_BASE}${API_ROUTES.pipeline.models(stage)}`;
            const data = await base._fetchJson(url);

            base._store.update((s) => {
                const models = new Map(s.models);
                models.set(stage, data.models ?? data);
                return { ...s, models };
            });

            return base._get().models.get(stage);
        });
    }

    async function fetchParams(stage, { force = false } = {}) {
        if (!stage) throw new Error("missing stage");

        const st = base._get();
        if (!force && st.params.has(stage)) return st.params.get(stage);

        const key = _key("params", stage);

        return base._runOnce(key, async () => {
            const url = `${API_BASE}${API_ROUTES.pipeline.params(stage)}`;
            const data = await base._fetchJson(url);

            base._store.update((s) => {
                const params = new Map(s.params);
                params.set(stage, data.params ?? data);
                return { ...s, params };
            });

            return base._get().params.get(stage);
        });
    }

    /*
    Catalog response example:
    {
      "stages": {
        "analyzer": { "models": [...], "params": {...} },
        "encoder":  { "models": [...], "params": {...} }
      },
      "version": "2026-01-09T00:00:00Z"
    }
  */
    async function fetchCatalog({ force = false } = {}) {
        const st = base._get();
        if (!force && st.models.size && st.params.size) return { models: st.models, params: st.params };

        const key = "catalog";

        return base._runOnce(key, async () => {
            const url = `${API_BASE}${API_ROUTES.pipeline.catalog}`;
            const data = await base._fetchJson(url);

            base._store.update((s) => {
                const models = new Map(s.models);
                const params = new Map(s.params);

                for (const [stage, info] of Object.entries(data.stages ?? {})) {
                    if (info?.models) models.set(stage, info.models);
                    if (info?.params) params.set(stage, info.params);
                }

                return { ...s, models, params, version: data.version ?? s.version };
            });

            const next = base._get();
            return { models: next.models, params: next.params, version: next.version };
        });
    }

    return {
        subscribe: base.subscribe,
        fetchModels,
        fetchParams,
        fetchCatalog,

        get models() {
            return base._get().models;
        },
        get params() {
            return base._get().params;
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

