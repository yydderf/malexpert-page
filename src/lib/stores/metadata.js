import { writable, get } from "svelte/store";
import { API_BASE, API_ROUTES } from "$lib/consts/api.js";

function createSampleMeta() {
    const store = writable({
        byId: new Map(),
        loading: new Set(),
        error: new Map(),
    });

    async function fetchMeta(sample_id, { force = false } = {}) {
        const st = get(store);
        if (!sample_id) throw new Error("missing sample_id");
        if (!force && st.byId.has(sample_id)) return st.byId.get(sample_id);
        // might be fetched concurrently
        if (st.loading.has(sample_id)) return;

        store.update(s => {
            const loading = new Set(s.loading);
            loading.add(sample_id);
            const error = new Map(s.error);
            error.delete(sample_id);
            return { ...s, loading, error };
        });

        try {
            const res = await fetch(`${API_BASE}${API_ROUTES.samples.meta(sample_id)}`);
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || `Failed to fetch metadata ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            store.update(s => {
                const byId = new Map(s.byId);
                byId.set(sample_id, data);
                const loading = new Set(s.loading);
                loading.delete(sample_id);
                return { ...s, byId, loading };
            });
            return data;
        } catch (e) {
            store.update(s => {
                const loading = new Set(s.loading);
                loading.delete(sample_id);
                const error = new Map(s.error);
                error.set(sample_id, e?.message ?? String(e));
                return { ...s, loading, error };
            });
            throw e;
        }
    }

    return { subscribe: store.subscribe, fetchMeta };
}

export const sampleMeta = createSampleMeta();
