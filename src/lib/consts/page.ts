export const SECTION_HELP_MSG = {
    "Metadata": { 
        help: "Some simple information about the given binary.",
    },
    "Pipeline": {
        help: "Malexpert is a system that processes the target binary in a pipeline composed by multiple components, which can be arranged in a limited way.\n\n\
Click the buttons below to set up a customized pipeline."
    },
    "Log": {
        help: "Logging from the command line interface in the backend."
    },
    "TemporalGraph": {
        help: "Simulated temporal force graph based on the selected pipeline."
    },
    "Dropzone": { help: null },
    "Analysis Results": { help: null },
} as const;

export type SectionName = keyof typeof SECTION_HELP_MSG;
