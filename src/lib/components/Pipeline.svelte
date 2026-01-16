<script lang="ts">
// import Drawer from '$lib/components/Drawer.svelte';
import StageDialog from "$lib/components/DialogBits.svelte";
import { derived, type Readable } from "svelte/store";
import { STAGE_ORDER, type PipelineStageName } from "$lib/consts/pipeline.ts";
import { capitalizeFirst } from "$lib/common/string.js";
let { pipeline } = $props();
const { ready, last_stage, user_selections, catalog, descriptions: stage_descriptions } = pipeline;

$inspect(`ready: ${$ready}`);
$inspect(`last stage: ${$last_stage?.stage}`);
// make a selected list with an init stage (analyze)

// "click to select the next stage" -> show next stage
// from the last item in the selected stage

// stage selection -> (inner) model selection
// selected stage can be modified
// conflicting stages after the modified stage were cleared
</script>

<!-- 
# defines the name of each stage selection button
# controls which stage is possible to be put next
# controls which model can be selected
-->
<div class="pipeline flex flex-col gap-4">
    <!-- <Drawer title="Analyzer" trigger="trigger-1" /> -->
    {#if $ready}
        {#each $user_selections as sel, idx }
            <StageDialog dialogTitle={capitalizeFirst(sel.stage)}
                dialogTrigger={capitalizeFirst(sel.stage)}
                dialogDescription={$stage_descriptions[sel.stage]}
                dialogStage={sel.stage}
                dialogIndex={idx}
            />
        {/each}
        {#if ($catalog.stages?.[$last_stage.stage]?.next?.length ?? 0) !== 0}
            {#key $user_selections.length}
                <StageDialog dialogTitle="Select the Next Stage"
                    dialogTrigger="Click to set the next stage"
                    dialogDescription="Hover over the buttons to see the details"
                    dialogStage={null}
                    dialogIndex={null}
                />
            {/key}
        {/if}
    {:else}
        {#if $pipeline.loading.has("catalog")}
            <p>Loading catalog...</p>
        {/if}
    {/if}
</div>
