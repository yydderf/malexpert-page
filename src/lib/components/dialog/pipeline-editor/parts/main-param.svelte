<script lang="ts">
import { pipeline } from "$lib/stores/pipeline.ts";
import TipButton from "./tip-button.svelte";

const { catalog } = pipeline;

let {
    currentStage: current_stage,
} = $props<{
    currentStage?: PipelineStageName | null;
}>();

const param_selections = $derived.by(() => {
    const param_spec = current_stage === null ? {} : $catalog.stages?.[current_stage]?.params;
    const result = Object.entries(param_spec).map(([param, spec]) => ({
        name: param, help: spec.help,
    }));
    return result;
});

</script>

<div class="flex flex-col items-center gap-2">
    <div class="flex flex-row justify-center items-center gap-2 py-2 mt-4">
        {#each param_selections as item, idx } <!-- ModelInfo { name, help } -->
            {#if idx > 0}<span class="opcaity-40 px-1">::</span>{/if}
            <TipButton buttonTitle={item.name}
                buttonDescription={item.help}
                tipside="top"
                onClickFunc={() => {
                }}
            >
            </TipButton>
        {/each}
    </div>
</div>
