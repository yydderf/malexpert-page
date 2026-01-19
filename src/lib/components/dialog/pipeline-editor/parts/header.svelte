<script lang="ts">
import { Dialog } from "bits-ui";
import { EDITOR, type PipelineStageName } from "$lib/consts/pipeline.ts";
import { pipeline, editor, type SelectionItem } from "$lib/stores/pipeline.ts";
import { capitalizeFirst } from "$lib/common/string.js";
import StepChip from "./chip-button.svelte";

const { user_selections, descriptions: stage_descriptions } = pipeline;
const { setStep } = editor;
let {
    currentIndex: current_index,
    currentSelection: current_selection,
    currentStage: current_stage,
} = $props<{
    currentIndex?: number | null;
    currentSelection?: SelectionItem | null;
    currentStage?: PipelineStageName | null;
}>();

const dialog_title = $derived.by(() => {
    if (current_selection === null) return "Select the Next Stage";
    if ($editor.step === EDITOR.STEPS.STAGE) return "Select the Stage";
    return capitalizeFirst(current_stage);
});

const dialog_description = $derived.by(() => {
    if (current_selection === null) return "Hover over the options to see the details";
    if ($editor.step === EDITOR.STEPS.STAGE) {
        if (current_index === 0) return "Analyzer must be the first stage";
        const prev_stage = $user_selections[current_index - 1]?.stage ?? ""
        return `after ${prev_stage} (current selection: ${current_selection?.stage ?? ""})`;
    }
    return $stage_descriptions[current_stage];
});

</script>

<header>
    <Dialog.Title class="text-accent dark:text-dark-accent">{dialog_title}</Dialog.Title>
    <Dialog.Description class="text-xs">
        {dialog_description}
    </Dialog.Description>
    <div class="mt-3 flex items-center gap-2 text-xs pb-2">
        <StepChip active={$editor.step === EDITOR.STEPS.STAGE}
            onClickFunc={() => {
                setStep(EDITOR.STEPS.STAGE);
            }}
        >
            {#snippet chipName()}
                Stage
            {/snippet}
        </StepChip>
        <span class="opacity-40"></span>
        <StepChip active={$editor.step === EDITOR.STEPS.MODEL}
            disabled={current_selection === null}
            onClickFunc={() => {
                if (current_selection !== null) setStep(EDITOR.STEPS.MODEL);
            }}
        >
            {#snippet chipName()}
                Model
            {/snippet}
        </StepChip>
        <span class="opacity-40"></span>
        <StepChip active={$editor.step === EDITOR.STEPS.PARAM}
            disabled={current_selection === null}
            onClickFunc={() => {
                if (current_selection !== null) setStep(EDITOR.STEPS.PARAM);
            }}
        >
            {#snippet chipName()}
                Params
            {/snippet}
        </StepChip>
    </div>
</header>

