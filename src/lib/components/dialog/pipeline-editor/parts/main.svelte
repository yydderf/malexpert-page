<script lang="ts">
import { EDITOR } from "$lib/consts/pipeline.ts";
import { pipeline, editor } from "$lib/stores/pipeline.ts";

import MainStage from "./main-stage.svelte";
import MainModel from "./main-model.svelte";
import MainParam from "./main-param.svelte";

let {
    currentIndex: current_index,
    currentSelection: current_selection,
    currentStage: current_stage,
} = $props<{
    currentIndex?: number | null;
    currentSelection?: SelectionItem | null;
    currentStage?: PipelineStageName | null;
}>();

</script>
<main>
    {#key $editor.step}
        <!-- <div in:fade={{ duration: FADE_DURATION.IN }} out:fade={{ duration: FADE_DURATION.OUT }}> -->
        <div>
            {#if $editor.step === EDITOR.STEPS.STAGE}
                <MainStage
                    currentIndex={current_index}
                    currentStage={current_stage}
                />
            {:else if $editor.step === EDITOR.STEPS.MODEL}
                <MainModel
                    currentIndex={current_index}
                    currentStage={current_stage}
                    currentSelection={current_selection}
                />
            {:else}
                <MainParam
                    currentStage={current_stage}
                />
            {/if}
        </div>
    {/key}
</main>

