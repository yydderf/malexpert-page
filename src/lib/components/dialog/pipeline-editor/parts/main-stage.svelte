<script lang="ts">
import { EDITOR } from "$lib/consts/pipeline.ts";
import { pipeline, editor } from "$lib/stores/pipeline.ts";
import TipButton from "./tip-button.svelte";

const { catalog, allowedStages, user_selections, setStage, setNextStage } = pipeline;
const { setStep, setTarget } = editor;

let {
    currentIndex: current_index,
    currentStage: current_stage,
} = $props<{
    currentIndex?: number | null;
    currentStage?: PipelineStageName | null;
}>();

const stage_selections = $derived($allowedStages(current_index).map((st) => ({
    stage: st, description: $catalog.stages?.[st]?.description ?? "",
})));

</script>
<div class="flex flex-col items-center gap-2">
    <div class="flex flex-col md:flex-row justify-center items-center gap-2 py-2 mt-4">
        {#each stage_selections as item, idx }
            {#if idx > 0}<span class="opcaity-40 px-1">::</span>{/if}
            <TipButton buttonTitle={item.stage}
                buttonDescription={item.description}
                tipside="top"
                selected={item.stage === current_stage}
                onClickFunc={() => {
                    if ($editor.target?.kind === EDITOR.KINDS.APPEND) {
                        setNextStage(item.stage);
                        setTarget({ kind: EDITOR.KINDS.EDIT, index: ($user_selections.length - 1) });
                    } else {
                        setStage(current_index, item.stage);
                    }
                    setStep(EDITOR.STEPS.MODEL);
                }}
            >
            </TipButton>
        {/each}
    </div>
</div>

