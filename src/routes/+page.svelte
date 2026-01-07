<script>
import Footer from '$lib/components/layout/Footer.svelte';
import Dropzone from '$lib/components/Dropzone.svelte';
import { sampleMeta } from "$lib/stores/metadata.js";
import { shortenName, ShortenMode } from "$lib/common/string.js";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER, BULLET_POINT } from "$lib/consts/meta.js";

let current_id = null;
let sample_meta = null;
async function handleUploaded(e) {
    current_id = e.detail.sample_id;
    const result = await sampleMeta.fetchMeta(current_id);
    sample_meta = result
}

$: meta_lines = sample_meta
    ? [
        { label: "Size",        value: sample_meta.size },
        { label: "Hash",        value: shortenName(sample_meta.hash, 10, ShortenMode.PREFIX_SUFFIX) },
        { label: "Arch",        value: `${sample_meta.arch} ${sample_meta.bitness}-bit` },
        { label: "Type",        value: sample_meta.exec_type },
        { label: "Entropy",     value: sample_meta.entropy },
        // { label: "Created",     value: sample_meta.created },
        // { label: "Modified",    value: sample_meta.modified },
        { label: "Endianness",  value: sample_meta.endianness },
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
            <Dropzone on:uploaded={handleUploaded} />
        </section>
        <section class="flex flex-col gap-4 text-xs">
            <div class="panel">
                <div class="panel-title pb-4">Metadata</div>
                <div class="
                    {sample_meta ? 'h-auto' : ''}
                    transition-all duration-1000
                    ">
                    {#each meta_lines as item, i}
                        <p use:typewriter={{
                            text: `${BULLET_POINT}${item.label}: ${item.value}`,
                            speed: TYPEWRITER.base_speed,
                            delay: TYPEWRITER.base_delay * i }}
                        ></p>
                    {/each}
                </div>
            </div>
            <div class="panel-title">Analysis Results</div>
            <pre>
            </pre>
        </section>

    </div>
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[100%] max-w-4/5 lg:max-w-3/5 h-20 bg-slate-900 rounded-2xl">
        Floating bottom panel
    </div>
    <Footer />
</div>
