import { writable, get } from "svelte/store";
import { API_BASE, API_ROUTES } from "$lib/consts/api.ts";

const initial = {
    uploading: false,
    error: null,
    result: null,
};

function createSampleUpload() {
    const store = writable({ ...initial });
    const { subscribe, set, update } = store;

    async function upload(file) {
        if (!file) return;
        if (get(store).uploading) return;
        // reset state as well
        update((st) => ({ ...st, uploading: true, error: null, result: null }));

        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch(`${API_BASE}${API_ROUTES.SAMPLES.UPLOAD}`, {
                method: "POST",
                body: form,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                update((st) => ({ ...st, uploading: false, error: err ?? { title: "Upload failed", detail: `HTTP ${res.status}` }, result: null }));
                return;
            }

            const ct = res.headers.get("content-type") || "";
            const result = ct.includes("application/json") ? await res.json() : await res.text();

            update((st) => ({ ...st, uploading: false, error: null, result}));
            return result;
        } catch(e) {
            update((st) => ({ ...st, uploading: false, error: { title: "Network Error", detail: e?.message ?? String(e), }, result: null }));
            throw e;
        }
    }

    function reset() {
        set({ ...initial });
    }

    return { subscribe, upload, reset };
}

export const sampleUpload = createSampleUpload();
