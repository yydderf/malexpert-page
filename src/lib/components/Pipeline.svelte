<script lang="ts">
// import Drawer from '$lib/components/Drawer.svelte';
import { fade } from "svelte/transition";
import StageDialog from "$lib/components/dialog/pipeline-editor/PipelineStageDialog.svelte";
import { type CarouselAPI, getEmblaContext } from "$lib/components/carousel/context.ts";
import * as Carousel from "$lib/components/carousel/index.ts";
import { derived, type Readable } from "svelte/store";
import { STAGE_ORDER, type PipelineStageName } from "$lib/consts/pipeline.ts";
import { TRANSITION } from "$lib/consts/transition.ts";
import { capitalizeFirst } from "$lib/common/string.js";
import { pipeline, editor } from "$lib/stores/pipeline.ts";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER } from "$lib/consts/typewriter.ts";

// let { pipeline } = $props();
const { openEditor, setStep } = editor;
const { ready, last_stage, user_selections, catalog, descriptions: stage_descriptions, setTouched } = pipeline;
const animate = (node, args) => args.set_slide ? slide(node, args) : fade(node, args);

let {
    analysisStarted: analysis_started = false,
} = $props<{
    analysisStarted: boolean;
}>();

let carouselApi = $state<CarouselAPI>();
let current = $state(0);
let after_transition = $state(false);
let viewportEl: HTMLDivElement;
const carouselCount = $derived(carouselApi ? carouselApi.scrollSnapList().length() : 0);

function onTransitionEnd(e: TransitionEvent) {
    if (e.propertyName !== "max-height") return;
    carouselApi?.reInit();
    after_transition = true;
    // console.dir(carouselApi);
    // console.log(carouselApi.canScrollPrev());
    // console.log(carouselApi.canScrollNext());
}

// TODO: paging of carousel
// $effect(() => {
//     if (carouselApi) {
//         current = carouselApi.selectedScrollSnap() + 1;
//         carouselApi.on("select", () => {
//             current = carouselApi!.selectedScrollSnap() + 1;
//         });
//     }
// });

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
        <Carousel.Root 
            setApi={(emblaApi) => (carouselApi = emblaApi)}
            opts={{
                align: "start",
            }}
            orientation="vertical"
            class="w-full">
            <Carousel.Content class="
                {analysis_started ? "max-h-30" : "max-h-300"}
                transition-[max-height] duration-1000"
                containerClass="{analysis_started ? "overflow-hidden" : "overflow-visible"}"
                bind:this={viewportEl}
                ontransitionend={onTransitionEnd}
            > <!-- h-30 -->
                {#each $user_selections as sel, idx }
                    <Carousel.Item>
                        <button type="button" class="
                            relative
                            w-full h-24
                            {(sel.selection.model.val === null && !analysis_started) ? "border-dashed" : ""}
                            selectable-border-region button-general
                            animate-in fade-in-5 zoom-in-95
                            "
                            onclick={() => {
                                setTouched(idx);
                                openEditor({ kind: "edit", index: idx }, sel.selection.last_step);
                            }}
                        >
                            <steps>
                                <stepstage>{capitalizeFirst(sel.stage)}</stepstage>
                                <stepmodel>{sel.selection.model?.val ? `: ${capitalizeFirst(sel.selection.model?.val)}` : ` : ${capitalizeFirst(sel.selection.model.default)} (default)`}</stepmodel>
                                <stepparam></stepparam>
                            </steps>
                            {#if (!sel.touched && !analysis_started)}
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
                    </Carousel.Item>
                {/each}
                {#if (($catalog.stages?.[$last_stage.stage]?.next?.length ?? 0) !== 0 && !after_transition)}
                    {#key $last_stage.stage}
                        <div class="pt-4">
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
                        </div>
                    {/key}
                {/if}
            </Carousel.Content>
            {#if analysis_started}
                <div transition:fade={{delay: TRANSITION.DELAY * 4, duration: TRANSITION.DURATION}}>
                    <Carousel.Previous class="start-full -top-2/5 left-17/20"/>
                    <Carousel.Next class="start-full -top-2/5 left-19/20"/>
                </div>
            {/if}
        </Carousel.Root>
        <StageDialog />
    {:else}
        {#if $pipeline.loading.has("catalog")}
            <p>Loading catalog...</p>
        {/if}
    {/if}
</div>
