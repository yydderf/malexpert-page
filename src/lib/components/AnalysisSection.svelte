<script lang="ts">
import SectionTitle from "$lib/components/SectionTitle.svelte";
import Analysis from "$lib/components/Analysis.svelte";

import { Progress } from "bits-ui";
import { cubicInOut } from "svelte/easing";
import { Tween } from "svelte/motion";

let analysis_started = $state(false);

let {
    sampleId: sample_id,
} = $props<{
    sampleId: number
}>();

const tween = new Tween(13, { duration: 1000, easing: cubicInOut });

</script>

<SectionTitle class="pb-4" sectionName="Analysis Results" runIf={sample_id !== null}>
    {#snippet embeddedComp()}
        {#if analysis_started}
            <div class="flex-1 min-w-0">
                <Progress.Root max={100} 
                    class="bg-accent/30 dark:bg-dark-accent/30
                    w-full h-[8px] rounded-2xl
                    overflow-hidden
                    animate-in slide-in-from-left-5
                    "
                >
                    <div
                        class="bg-accent dark:bg-dark-accent h-full w-full rounded-2xl"
                        style={`transform: translateX(-${100 - (100 * (tween.current ?? 0)) / 100}%)`}
                    ></div>
                </Progress.Root>
            </div>
        {/if}
    {/snippet}
</SectionTitle>
<Analysis sampleId={sample_id} bind:started={analysis_started}/>
