import { PUBLIC_API_BASE } from "$env/static/public";
import { type PipelineStageName } from "$lib/consts/pipeline.ts";

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
        RESULTS: (job_id: string, stage: string): string => `/jobs/${encodeURIComponent(job_id)}/results/${stage}`,
    }
} as const;

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

export type AnalyzerLibraries = string[];
// {
//   "name": "fcn.004010c0",
//   "offset": 4198592,
//   "islib": false,
//   "libname": ""
// },
export type AnalyzerImport = { name: string; offset: number; islib: boolean, libname: string };
// libraries -> list, imports -> table
export type AnalyzerResult  = { libraries: AnalyzerLibraries; imports: AnalyzerImport[]; }
export type EncoderResult   = { total_embed: number; null_embed: number }; // encoding ratio / ?
export type ExpanderResult  = { orig_func: number; expd_func: number; expded_df: AnalyzerImport[] }; // expansion ratio
export type AugmentorResult = { total_embed: number; null_embed_before: number; null_embed_after: number }; // augmentation ratio
export type DetectorResult  = { benign_prob: number; malicious_prob: number }; // detecting result -> benign / malicious percentage
export type GraphNode = { label: string; importance: number; id: string };
export type GraphLink = { source: number; target: number; importance: number };
export type Graph = { nodes: GraphNode[]; links: GraphLink[] };
// d3 / gephi lite -> interactive graph generation
export type ExplainerResult = { graph: Graph; }; // explanation graph -> accorion horizontal cards -> focus -> semi-fullscreen (interactable of each node) -> animation of edges

export type StageResult = AnalyzerResult | EncoderResult | ExpanderResult | AugmentorResult | DetectorResult | ExplainerResult;
export type AnalysisResult = { stage: string; result: StageResult };
