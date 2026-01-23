export const STAGE_ORDER = [
    "analyzer",
    "encoder",
    "expander",
    "augmentor",
    "detector",
    "explainer",
] as const;

export type PipelineStageName = (typeof STAGE_ORDER)[number];

export type StageInfo = { name: PipelineStageName; help: string };
export type ModelInfo = { name: string; help: string };
export type ParamSpec = { type: string; default: unknown };
// export type ParamSpec = {
//     type: string;
//     default: unknown; // default value of the parameter
//     description: string | null;
//     source: "ui" | "api"; // the source of the param (some params might be ui rendered?)
//     label: string; // display name of the parameter
// };

export const EDITOR = {
    STEPS: {
        STAGE: "stage",
        MODEL: "model",
        PARAM: "params",
    },
    KINDS: {
        APPEND: "append",
        EDIT: "edit",
    },
} as const;

export type EditorStep = typeof EDITOR.STEPS[keyof typeof EDITOR.STEPS];
export type EditorKind = typeof EDITOR.KINDS[keyof typeof EDITOR.KINDS];

// TODO
//
export const DEFAULT = {
    PARAM: {
        HIDE_STAGE_OUTPUT: "hide_stage_output",
    },
} as const;

export const UI_PARAMS = {
    emit_stage_output: {
        type: "bool",
        default: true,
        description: null,
        source: "ui",
    },
} as const;
