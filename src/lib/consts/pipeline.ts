export const STAGE_ORDER = [
    "analyzer",
    "encoder",
    "expander",
    "augmentor",
    "detector",
    "explainer",
] as const;

export type PipelineStageName = (typeof STAGE_ORDER)[number];

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
