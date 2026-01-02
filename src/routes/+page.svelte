<script>
import Footer from '../lib/components/layout/Footer.svelte';
import Dropzone from '../lib/components/Dropzone.svelte';

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
    <div class="inner-container grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section class="flex flex-col gap-4">
            <Dropzone />
        </section>
        <section class="flex flex-col gap-4 text-xs">
            <div class="panel">Metadata</div>
            <pre></pre>
            <div class="panel">analysis results</div>
            <pre></pre>
        </section>

    </div>
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[100%] max-w-4/5 lg:max-w-3/5 h-20 bg-slate-900 rounded-2xl">
        Floating bottom panel
    </div>
    <Footer />
</div>
