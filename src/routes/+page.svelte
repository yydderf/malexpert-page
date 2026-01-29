<script lang="ts">
import Footer from "$lib/components/layout/Footer.svelte";
import Dropzone from "$lib/components/Dropzone.svelte";
import Pipeline from "$lib/components/Pipeline.svelte";
import Metadata from "$lib/components/Metadata.svelte";
import Analysis from "$lib/components/Analysis.svelte";
import SectionTitle from "$lib/components/SectionTitle.svelte";
import { sampleMeta } from "$lib/stores/metadata.js";
import { pipeline } from "$lib/stores/pipeline.ts";

let title = "MalExpert";

let current_id = $state(null);

async function fetchSampleMeta(e) {
    current_id = e.detail.sample_id;
    await sampleMeta.fetchMeta(current_id);
}
async function fetchPipelineCatalog(e) {
    try {
        await pipeline.fetchCatalog();
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load pipeline catalog";
        console.log(err);
        alert(msg);
    }
}

// executed twice (when current_id or sampleMeta.byId changes)
// loading state can be used (current_id has val but sampleMeta.byId is not ready)
const current_meta = $derived(current_id ? $sampleMeta.byId.get(current_id) : null);

</script>

<div class="max-w-4/5 lg:max-w-3/5 mx-auto">
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
                fetchPipelineCatalog(e);
            }} />
            <SectionTitle class="pb-4" sectionName="Pipeline" runIf={current_id !== null } />
            <Pipeline />
        </section>
        <section class="flex flex-col gap-4 text-xs">
            <div class="panel">
                <SectionTitle class="pb-4" sectionName="Metadata" runIf={current_id !== null} />
                <Metadata currentMeta={current_meta} />
            </div>
            <SectionTitle class="pb-4" sectionName="Analysis Results" runIf={current_id !== null} />
            <Analysis currentId={current_id} />
        </section>
    </div>
    <Footer />
</div>
