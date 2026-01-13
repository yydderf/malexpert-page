<script lang="ts">
// import Drawer from '$lib/components/Drawer.svelte';
import Dialog from '$lib/components/Dialog.svelte';
import { STAGE_ORDER, type PipelineStageName } from "$lib/consts/pipeline.ts";
import { capitalizeFirst } from "$lib/common/string.js";
export let pipeline;
</script>

<!-- 
# defines the name of each stage selection button
# controls which stage is possible to be put next
# controls which model can be selected
-->
<div class="pipeline flex flex-col gap-4">
    <!-- <Drawer title="Analyzer" trigger="trigger-1" /> -->
    <Dialog dialogTitle="Analyzer" 
        dialogDescription="this component extract function information from the binary"
    />
    {#each STAGE_ORDER as stage (stage)}
        <Dialog dialogTitle={capitalizeFirst(stage)}
        />
    {/each}
</div>
