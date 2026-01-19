export const STAGE_ORDER = [
    "analyzer",
    "encoder",
    "expander",
    "augmentor",
    "detector",
    "explainer",
] as const;

export type PipelineStageName = (typeof STAGE_ORDER)[number];
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

// InitStage(args)
// .analyze()
// .encode()
// .expand()
// .augment()
// .detect()
// .explain()

// export type PipelineStageName =
//     | "analyzer"
//     | "encoder"
//     | "expander"
//     | "augmentor"
//     | "detector"
//     | "explainer";
