import { PUBLIC_API_BASE } from "$env/static/public";
import { PipelineStageName } from "$lib/consts/pipeline.ts";

export const API_BASE: string = PUBLIC_API_BASE;

export const API_ROUTES = {
    SAMPLES: {
        META: (id: string): string => `/samples/${encodeURIComponent(id)}/metadata`,
        RUN: (id: string): string => `/samples/${encodeURIComponent(id)}/run`,
        UPLOAD: `/samples/upload/form`,
    },
    PIPELINE: {
        CATALOG: `/pipeline/catalog`,
        MODELS: (stage: PipelineStageName): string => `/pipeline/${stage}/models`,
        PARAMS: (stage: PipelineStageName): string => `/pipeline/${stage}/params`,
    },
} as const;
