<script lang="ts">
import Footer from "$lib/components/layout/Footer.svelte";
import Dropzone from "$lib/components/Dropzone.svelte";
import Pipeline from "$lib/components/Pipeline.svelte";
import Metadata from "$lib/components/Metadata.svelte";
import SectionTitle from "$lib/components/SectionTitle.svelte";
import AnalysisSection from "$lib/components/AnalysisSection.svelte";
import { Toaster, toast } from "svelte-sonner";
import { sampleMeta } from "$lib/stores/metadata.js";
import { pipeline } from "$lib/stores/pipeline.ts";
import { SECTION_HELP_MSG, type SectionName } from "$lib/consts/page.ts";
import InfoPopover from "$lib/components/InfoPopover.svelte";

let title = "MalExpert";

let sample_id = $state(null);
let analysis_started = $state(false);

let section_active_zval = $state<Record<SectionName, boolean>>(
    Object.fromEntries(
        (Object.keys(SECTION_HELP_MSG) as SectionName[]).map((k) => [k, false])
    ) as Record<SectionName, boolean>
);

async function fetchSampleMeta(e) {
    sample_id = e.detail.sample_id;
    await sampleMeta.fetchMeta(sample_id);
}

async function fetchPipelineCatalog() {
    try {
        await pipeline.fetchCatalog();
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load pipeline catalog";
        toast.error("Failed to fetch catalog", {
            description: msg,
            action: {
                label: "Retry",
                onClick: () => fetchPipelineCatalog()
            }
        });
    }
}

// executed twice (when sample_id or sampleMeta.byId changes)
// loading state can be used (sample_id has val but sampleMeta.byId is not ready)
const current_meta = $derived(sample_id ? $sampleMeta.byId.get(sample_id) : null);

</script>

<!-- 
TODO: change the background to red warning lines when the analysis result is malicious
TODO: full screen overlay of graph
    - the original container of the graph is hidden
    - full screen button is located at the top right corner of the svg
TODO: add real-time cli logging feed under pipeline
TODO: add real-time? temporal force graph based on graph sse signals
-->

<div class="max-w-4/5 lg:max-w-3/5 mx-auto">
    <Toaster 
        theme="dark"
        position="top-right"
    />
    <div class="inner-container ">
        <h1>Welcome to {title}</h1>
        <p class="my-4">Upload a binary file to generate an analysis report (metadata, function importance, graph, ...)</p>
        <p class="my-4">The malware analysis pipeline was inspired by <a class="italic" href="https://people.cs.nycu.edu.tw/~chuang/pubs/pdf/2023tifs.pdf">Guided Malware Sample Analysis Based on Graph Neural Networks</a><br /> and was completed under the guidance of <a class="italic" href="https://www.cs.nycu.edu.tw/members/detail/chuang">Professor Chun-Ying Huang</a></p>
        <p>Source code <a class="italic" href="https://github.com/yydderf/MalwareExpert-Implementation">yydderf/MalwareExpert-Implementation</a></p>
    </div>
    <div class="inner-container grid text-xs grid-cols-1 xl:grid-cols-2 gap-6">
        <section class="flex flex-col gap-4">
            <!-- <SectionTitle sectionName="Dropzone" duration={0} runIf={true} /> -->
            <div class="panel-title">Dropzone</div>
            <Dropzone on:uploaded={(e) => {
                fetchSampleMeta(e);
                fetchPipelineCatalog();
            }} />
            <SectionTitle class="pb-4" sectionName="Pipeline" runIf={sample_id !== null } zval={section_active_zval["Pipeline"]}>
                {#snippet embeddedComp()}
                    <InfoPopover duration={200} item={SECTION_HELP_MSG["Pipeline"]} type="title" bind:zval={section_active_zval["Pipeline"]} />
                {/snippet}
            </SectionTitle>
            <Pipeline analysisStarted={analysis_started}/>
        </section>
        <section class="flex flex-col gap-4 text-xs">
            <div class="panel">
                <SectionTitle class="pb-4" sectionName="Metadata" runIf={sample_id !== null} zval={section_active_zval["Metadata"]}>
                    {#snippet embeddedComp()}
                        <InfoPopover duration={200} item={SECTION_HELP_MSG["Metadata"]} type="title" bind:zval={section_active_zval["Metadata"]} />
                    {/snippet}
                </SectionTitle>
                <Metadata currentMeta={current_meta} />
            </div>
            <AnalysisSection sampleId={sample_id} bind:analysis_started />
        </section>
    </div>
    <!-- <button onclick={() => toast('My first toast')}>Give me a toast</button> -->
    <Footer />
</div>
