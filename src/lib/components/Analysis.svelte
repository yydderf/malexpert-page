<script lang="ts">
import { Progress, Accordion } from "bits-ui";
import { fade } from "svelte/transition";
import { pipeline } from "$lib/stores/pipeline.ts";
import { runner } from "$lib/stores/runner.ts";
import { toast } from "svelte-sonner";
import { EVENTS } from "$lib/consts/api.ts";
import { type PipelineStageName } from "$lib/consts/pipeline.ts";
import { capitalizeFirst } from "$lib/common/string.js";
import CaretDown from "phosphor-svelte/lib/CaretDown";

import UnknownView   from "$lib/components/results/UnknownStageView.svelte";
import AnalyzerView  from "$lib/components/results/AnalyzerView.svelte";
import ExpanderView  from "$lib/components/results/ExpanderView.svelte";
import AugmentorView from "$lib/components/results/AugmentorView.svelte";
import EncoderView   from "$lib/components/results/EncoderView.svelte";
import DetectorView  from "$lib/components/results/DetectorView.svelte";
import ExplainerView from "$lib/components/results/ExplainerView.svelte";

let { registerJob, results } = runner;
let { ready, user_selections } = pipeline;
let {
    started = $bindable(false),
    sampleId: sample_id,
} = $props<{
    sampleId: string | null;
    started: boolean;
}>();

const VIEW_BY_STAGE: Record<PipelineStageName, any> = {
    analyzer: AnalyzerView,
    expander: ExpanderView,
    augmentor: AugmentorView,
    encoder: EncoderView,
    detector: DetectorView,
    explainer: ExplainerView,
};

function isStageName(st: string): st is PipelineStageName {
    return st in VIEW_BY_STAGE
}

</script>

<div>
    {#if $ready }
        {#if $runner.status !== EVENTS.STATUS.DONE}
            <button transition:fade={{ duration: 200 }}
                type="button" class="
                relative
                w-full
                {$runner.status === EVENTS.STATUS.DONE ? "h-0" : "h-24"}
                border-dashed
                selectable-border-region button-general
                animate-in fade-in-5 zoom-in-95
                transition-all duration-100
                "
                onclick={() => {
                    if (sample_id !== null && !started) {
                        started = true;
                        toast.promise(
                            registerJob(sample_id, user_selections),
                            {
                                loading: "Submitting job...",
                                success: "Job started successfully",
                                error: "Failed to start job",
                            }
                        );
                    }
                }}
            >
                <div>
                    {$runner.status === EVENTS.STATUS.NOT_STARTED ? "Start Analyzing..." : `At Stage: ${$runner.stage}`}
                </div>
            </button>
        {:else}
            <!-- accordion of each stage slide in from left -->
            <div transition:fade={{ duration: 2000 }}>
                <Accordion.Root class="w-full border-t border-gray-500" type="multiple">
                    {#each $runner.results as item, i (`${item.stage}:${i}`)}
                        <Accordion.Item
                            value={`${item.stage}:${i}`}
                            class="
                            border-gray-500 group border-b px-1.5
                            animate-in fade-in-100
                            "
                        >
                            <Accordion.Header>
                                <Accordion.Trigger
                                    class="flex w-full flex-1 items-center justify-between
                                    select-none py-5 font-xs
                                    transition-all [&[data-state=open]>span>svg]:rotate-180"
                                >
                                    <span class="w-full text-left">
                                        {capitalizeFirst(item.stage)}
                                    </span>
                                    <span
                                        class="hover:bg-dark-10 inline-flex size-8
                                        items-center justify-center rounded-2xl
                                        bg-transparent"
                                    >
                                        <CaretDown class="size-[18px] transition-transform duration-200" />
                                    </span>
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content
                                class="
                                data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down
                                overflow-hidden text-xs tracking-[-0.01em]"
                            >
                                {@const StageComp = isStageName(item.stage.toLowerCase()) ? VIEW_BY_STAGE[item.stage.toLowerCase()] : UnknownView}
                                <StageComp result={item.result} name={item.stage} />
                            </Accordion.Content>
                        </Accordion.Item>
                    {/each}
                </Accordion.Root>
            </div>
        {/if}
    {/if}
</div>
