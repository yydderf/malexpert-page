import { get } from "svelte/store";
import { createBaseFetchStore } from "$lib/stores/base_fetch.ts";
import { API_BASE, API_ROUTES } from "$lib/consts/api.ts";

function createSampleMeta() {
    const base = createBaseFetchStore({
        byId: new Map(),
    });

    async function fetchMeta(sample_id, { force = false } = {}) {
        const st = base._get();
        if (!sample_id) throw new Error("missing sample_id");
        if (!force && st.byId.has(sample_id)) return st.byId.get(sample_id);
        // might be fetched concurrently
        const key = `meta:${sample_id}`;

        return base._runOnce(key, async () => {
            const url = `${API_BASE}${API_ROUTES.SAMPLES.META(sample_id)}`;
            const data = await base._requestJson(url);
            base._store.update((s) => {
                const byId = new Map(s.byId);
                byId.set(sample_id, data);
                return { ...s, byId };
            });
            return get(base._store).byId.get(sample_id);
        });
    }

    return {
        subscribe: base.subscribe,
        fetchMeta,

        get byId() {
            return base._get().byId;
        },
        get error() {
            return base._get().error;
        },
        get loading() {
            return base._get().loading;
        },
    };
}

export const sampleMeta = createSampleMeta();
