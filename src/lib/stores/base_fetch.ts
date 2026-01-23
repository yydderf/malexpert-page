import { writable, get, type Writable } from "svelte/store";

export type JsonMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ErrorValue = string;
export type BaseFetchState<K extends PropertyKey> = {
    error: Map<K, ErrorValue>;
    loading: Set<K>;
};

export type RequestJson = <T = unknown, B = unknown>(url: string, method?: JsonMethod, body?: B) => Promise<T>;
export type RunOnce<K extends PropertyKey> = <T>(
    key: K,
    fn: () => Promise<T>,
) => Promise<T>;

export type BaseFetchStore<
S extends Record<string, unknown>,
K extends PropertyKey = string,
> = {
    subscribe: Writable<BaseFetchState<K> & S>["subscribe"];
    _store: Writable<BaseFetchState<K> & S>;
    _get: () => BaseFetchState<K> & S;
    _requestJson: RequestJson;
    _runOnce: RunOnce<K>;
    _setError: (key: K, err: unknown) => void;
    _clearError: (key: K) => void;
    _setLoading: (key: K, on: boolean) => void;
};

function errorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
        return JSON.stringify(err);
    } catch {
        return String(err);
    }
}

export function createBaseFetchStore<
S extends Record<string, unknown>,
K extends PropertyKey = string,
>(initState: S): BaseFetchStore<S, K> {
    const store = writable<BaseFetchState<K> & S>({
        error: new Map<K, ErrorValue>(),
        loading: new Set<K>(),
        ...initState,
    });
    const inflight = new Map<K, Promise<unknown>>();
    function _setError(key: K, err: unknown): void {
        store.update((s) => {
            const next = { ...s, error: new Map(s.error) };
            next.error.set(key, errorMessage(err));
            return next;
        });
    }
    function _clearError(key: K): void {
        store.update((s) => {
            if (!s.error.has(key)) return s;
            const next = { ...s, error: new Map(s.error) }
            next.error.delete(key);
            return next;
        });
    }
    function _setLoading(key: K, on: boolean): void {
        store.update((s) => {
            const loading = new Set(s.loading);
            on ? loading.add(key) : loading.delete(key);
            return { ...s, loading };
        });
    }

    async function _requestJson<T = unknown, B = unknown>(
        url: string, method?: JsonMethod = "GET", body?: B = undefined
    ): Promise<T> {
        const res = await fetch(url, {
            method: method,
            headers: {
                Accept: "application/json",
                ...(body !== undefined ? { "Content-Type": "application/json" } : {} ),
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        const ct = res.headers.get("content-type") || "";
        const ret_body: unknown = ct.includes("application/json")
            ? await res.json()
            : await res.text();
        if (!res.ok) {
            // pub struct APIErrorBody {
            //     pub title: String,
            //     pub detail: Option<String>,
            // }
            const obj = ret_body as { title: string, detail?: unknown } | null;
            const msg =
                typeof ret_body === "object" && ret_body && ("title" in obj || "detail" in obj)
                    ? `${(obj.title ?? "Error") as string} : ${String(obj.detail) ?? ""}`.trim()
                    : `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return ret_body as T;
    }

    function _runOnce<T>(key: K, fn: () => Promise<T>): Promise<T> {
        const existing = inflight.get(key) as Promise<T> | undefined;
        if (existing) return existing;
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
        inflight.set(key, p as Promise<unknown>);
        return p;
    }

    return {
        subscribe: store.subscribe,
        _store: store,
        _get: () => get(store),
        _requestJson,
        _runOnce,
        _setError,
        _clearError,
        _setLoading,
    };
}
