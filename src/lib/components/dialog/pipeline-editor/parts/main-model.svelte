<script lang="ts">
import { EDITOR } from "$lib/consts/pipeline.ts";
import { pipeline, editor } from "$lib/stores/pipeline.ts";
import TipButton from "./tip-button.svelte";

const { catalog, setModel } = pipeline;
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

const model_selections = $derived(current_stage === null ? [] : $catalog.stages?.[current_stage]?.models);

</script>

<div class="flex flex-col items-center gap-2">
    <div class="flex flex-row justify-center items-center gap-2 py-2 mt-4">
        {#each model_selections as item, idx } <!-- ModelInfo { name, help } -->
            {#if idx > 0}<span class="opcaity-40 px-1">::</span>{/if}
            <TipButton buttonTitle={item.name}
                buttonDescription={item.help}
                tipside="top"
                selected={item.name === current_selection?.selection?.model ?? false}
                onClickFunc={() => {
                    setModel(current_index, item.name);
                    setStep(EDITOR.STEPS.PARAM);
                }}
            >
            </TipButton>
        {/each}
    </div>
</div>
