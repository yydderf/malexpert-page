import { writable, get } from "svelte/store";

export function createBaseFetchStore(initState) {
    const store = writable({
        error: new Map(),
        loading: new Set(),
        ...initState,
    });
    const inflight = new Map();


    function _setError(key, err) {
        store.update((s) => {
            const next = { ...s, error: new Map(s.error) };
            next.error.set(key, err instanceof Error ? err.message : String(err));
            return next;
        });
    }

    function _clearError(key) {
        store.update((s) => {
            if (!s.error.has(key)) return s;
            const next = { ...s, error: new Map(s.error) }
            next.error.delete(key);
            return next;
        });
    }

    function _setLoading(key, on) {
        store.update((s) => {
            const loading = new Set(s.loading);
            on ? loading.add(key) : loading.delete(key);
            return { ...s, loading };
        });
    }

    async function _fetchJson(url) {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        const ct = res.headers.get("content-type") || "";
        const body = ct.includes("application/json") ? await res.json() : await res.text();

        if (!res.ok) {
            const msg = 
                typeof body === "object" && body && (body.detail || body.title)
                    ? `${body.title ?? "Error"} : ${body.detail ?? ""}`.trim()
                    : `HTTP ${res.status}`;
            throw new Error(msg);
        }

        return body;
    }

    function _runOnce(key, fn) {
        if (inflight.has(key)) return inflight.get(key);
        const p = (async () => {
            _setLoading(key, true);
            _clearError(key);
            try {
                return await fn();
            } catch (e) {
                _setError(key, e);
                throw e;
            } finally {
                _setLoading(key, false);
                inflight.delete(key);
            }
        })();
        inflight.set(key, p);
        return p;
    }

    return {
        subscribe: store.subscribe,
        _store: store,
        _get: () => get(store),
        _fetchJson,
        _runOnce,
        _setError,
        _clearError,
        _setLoading,
    };
}
