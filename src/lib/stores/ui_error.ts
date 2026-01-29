import { writable } from "svelte/store";

export type UIError = {
    title: string;
    message: string;
    recoverable?: boolean;
    cause?: unknown;
};

function createUIErrorStore() {
    const { subscribe, set, update } = writable<UIError | null>(null);

    return {
        subscribe,
        set(error: UIError) {
            set(error);
        },
        clear() {
            set(null);
        },
        fromError(
            err: unknown,
            opts?: {
                title?: string;
                recoverable?: boolean;
                fallbackMessage?: string;
            }
        ) {
            const message = err instanceof Error ? err.message : opts?.fallbackMessage ?? "unexpected error";
            set({
                title: opts?.title ?? "Error",
                message,
                recoverable: opts?.recoverable ?? false,
                cause: err
            });
        }
    };
}

export const uiError = createUIErrorStore();
