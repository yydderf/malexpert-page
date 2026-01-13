<script>
import Footer from '$lib/components/layout/Footer.svelte';
import Dropzone from '$lib/components/Dropzone.svelte';
import Pipeline from '$lib/components/Pipeline.svelte';
import { sampleMeta } from "$lib/stores/metadata.js";
import { pipeline } from "$lib/stores/pipeline.ts";
import { shortenName, ShortenMode } from "$lib/common/string.js";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER, BULLET_POINT } from "$lib/consts/meta.ts";

let current_id = null;
let pipeline_catalog = null;

async function fetchSampleMeta(e) {
    current_id = e.detail.sample_id;
    await sampleMeta.fetchMeta(current_id);
}
async function fetchPipelineCatalog(e) {
    await pipeline.fetchCatalog();
}

// executed twice (when current_id or sampleMeta.byId changes)
// loading state can be used (current_id has val but sampleMeta.byId is not ready)
$: current_meta = current_id ? $sampleMeta.byId.get(current_id) : null;

$: meta_lines = current_meta
    ? [
        { label: "Size",        value: current_meta.size },
        { label: "Hash",        value: shortenName(current_meta.hash, 10, ShortenMode.PREFIX_SUFFIX) },
        { label: "Arch",        value: `${current_meta.arch} ${current_meta.bitness}-bit` },
        { label: "Type",        value: current_meta.exec_type },
        { label: "Entropy",     value: current_meta.entropy },
        { label: "Endianness",  value: current_meta.endianness },
    ] : [];

let title = "MalExpert";
</script>

<div class="max-w-4/5 lg:max-w-3/5 mx-auto">
    <div class="inner-container ">
        <h1>
            Welcome to {title}
        </h1>
        <p class="my-4">Upload a binary file to generate an analysis report (metadata, function importance, graph, ...)</p>
        <p class="my-4">This project is inspired by <a class="italic" href="https://people.cs.nycu.edu.tw/~chuang/pubs/pdf/2023tifs.pdf">Guided Malware Sample Analysis Based on Graph Neural Networks</a></p>
        <p>Source code <a class="italic" href="https://github.com/yydderf/MalwareExpert-Implementation">yydderf/MalwareExpert-Implementation</a></p>
    </div>
    <div class="inner-container grid text-xs grid-cols-1 xl:grid-cols-2 gap-6">
        <section class="flex flex-col gap-4">
            <div class="panel-title">Dropzone</div>
            <Dropzone on:uploaded={(e) => {
                fetchSampleMeta(e);
                fetchPipelineCatalog(e);
            }} />
            <div class="panel-title">Pipeline</div>
            <Pipeline pipeline={pipeline}/>
        </section>
        <section class="flex flex-col gap-4 text-xs">
            <div class="panel">
                <div class="panel-title pb-4">Metadata</div>
                <div class="
                    {current_meta ? 'h-auto' : ''}
                    transition-all duration-1000
                    ">
                    {#each meta_lines as item, i (item.label)}
                        <p use:typewriter={{
                            text: `${BULLET_POINT}${item.label}: ${item.value}`,
                            speed: TYPEWRITER.BASE_SPEED,
                            delay: TYPEWRITER.BASE_DELAY * i }}
                        ></p>
                    {/each}
                </div>
            </div>
            <div class="panel-title">Analysis Results</div>
            <pre>
            </pre>
        </section>
    </div>
    <Footer />
</div>
