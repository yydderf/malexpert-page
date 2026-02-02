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
    JOBS: {
        EVENTS: (job_id: string): string => `/jobs/${encodeURIComponent(job_id)}/events`,
        STATUS: (job_id: string): string => `/jobs/${encodeURIComponent(job_id)}/status`,
    }
} as const;

//     CREATED = "created"
//     RUNNING = "running"
// 
//     STAGE_START = "stage_start"
//     STAGE_DONE = "stage_done"
// 
//     HALTED = "halted"
//     ERROR = "error"
// 
//     DONE = "done"
//     ENDED = "ended"

// TODO: set status as constant
export const EVENTS = {
    NAME: {
        CREATED: "created",
        RUNNING: "running",

        STAGE_START: "stage_start",
        STAGE_DONE: "stage_done",

        HALTED: "message",
        ERROR: "error",

        DONE: "done",
        ENDED: "ended",

        HEARTBEAT: "heartbeat",
    },
    STATUS: {
        NOT_STARTED: "not-started",
        RUNNING: "running",
        ERROR: "error",
        DONE: "done",
    },
    PREFIX: {
        ID: "id:",
        EVENT: "event:",
        DATA: "data:",
    },
    LAST_ID: "Last-Event-ID",
} as const;

export type RunnerStatus = (typeof EVENTS.STATUS)[keyof typeof EVENTS.STATUS]
