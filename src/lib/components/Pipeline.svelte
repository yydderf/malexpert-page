<script lang="ts">
// import Drawer from '$lib/components/Drawer.svelte';
import StageDialog from "$lib/components/dialog/pipeline-editor/PipelineStageDialog.svelte";
import { derived, type Readable } from "svelte/store";
import { STAGE_ORDER, type PipelineStageName } from "$lib/consts/pipeline.ts";
import { capitalizeFirst } from "$lib/common/string.js";
import { pipeline, editor } from "$lib/stores/pipeline.ts";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER } from "$lib/consts/typewriter.ts";

// let { pipeline } = $props();
const { openEditor, setStep } = editor;
const { ready, last_stage, user_selections, catalog, descriptions: stage_descriptions, setTouched } = pipeline;

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
            <button type="button" class="
                relative
                w-full h-24
                {sel.selection.model === "" ? "border-dashed" : ""}
                selectable-border-region button-general
                animate-in fade-in-5 zoom-in-95
                "
                onclick={() => {
                    setTouched(idx);
                    openEditor({ kind: "edit", index: idx }, sel.selection.last_step);
                }}
            >
                <steps>
                    <!--<stepstage use:typewriter={{
                        text: `${capitalizeFirst(sel.stage)}`,
                        speed: TYPEWRITER.BASE_SPEED,
                        delay: TYPEWRITER.BASE_DELAY,
                    }}></stepstage>-->
                    <stepstage>{capitalizeFirst(sel.stage)}</stepstage>
                    <stepmodel>{sel.selection.model === "" ? "" : ` : ${capitalizeFirst(sel.selection.model)}`}</stepmodel>
                    <stepparam></stepparam>
                </steps>
                <!--
                {capitalizeFirst(sel.stage)}
                {sel.selection.model === "" ? "" : `: ${capitalizeFirst(sel.selection.model)}`}
                -->
                {#if !sel.touched}
                    <span class="
                        absolute top-0 right-0 w-6 h-6
                        border-2 border-current rounded-2xl
                        [clip-path:polygon(50%_0,100%_0,100%_50%,50%_50%)]
                        "></span>
                    <span class="
                        absolute top-0 right-0 w-6 h-6
                        border-2 border-current rounded-2xl
                        [clip-path:polygon(50%_0,100%_0,100%_50%,50%_50%)]
                        motion-safe:animate-ping
                        "></span>
                {/if}
            </button>
        {/each}
        {#if ($catalog.stages?.[$last_stage.stage]?.next?.length ?? 0) !== 0}
            {#key $last_stage.stage}
                <button type="button" class="
                    relative
                    w-full h-24
                    border-dashed
                    selectable-border-region button-general
                    animate-in fade-in-5 zoom-in-95
                    "
                    onclick={() => openEditor({ kind: "append" })}
                >
                    Click to set the next stage
                </button>
            {/key}
        {/if}
        <StageDialog />
    {:else}
        {#if $pipeline.loading.has("catalog")}
            <p>Loading catalog...</p>
        {/if}
    {/if}
</div>
