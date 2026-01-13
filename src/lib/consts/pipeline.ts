export const STAGE_ORDER = [
    "analyzer",
    "encoder",
    "expander",
    "augmentor",
    "detector",
    "explainer",
] as const;

export type PipelineStageName = (typeof STAGE_ORDER)[number];

// export type PipelineStageName =
//     | "analyzer"
//     | "encoder"
//     | "expander"
//     | "augmentor"
//     | "detector"
//     | "explainer";
