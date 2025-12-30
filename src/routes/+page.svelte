<!-- <div class="container"> -->
<div class="max-w-4/5 lg:max-w-3/5 mx-auto">
    <div class="inner-container ">
        <h1>
            Welcome to MalExpert
        </h1>
        <p class="my-4">Upload a binary file to generate an analysis report (metadata, function importance, graph, ...)</p>
        <p class="my-4">This project is inspired by <a class="italic" href="https://ieeexplore.ieee.org/document/10145856">Guided Malware Sample Analysis Based on Graph Neural Networks</a></p>
        <p>Source code <a class="italic" href="https://github.com/yydderf/MalwareExpert-Implementation">yydderf/MalwareExpert-Implementation</a></p>
    </div>
    <div class="inner-container grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section class="flex flex-col gap-4">
            <div class="flex items-center justify-center w-full">
                <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-2xl cursor-pointer hover:bg-neutral-tertiary-medium">
                    <div class="flex flex-col items-center justify-center text-body pt-5 pb-6">
                        <svg class="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/></svg>
                        <p class="mb-2 text-sm"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                        <p class="text-xs">.exe or ELF (max 50MiB)</p>
                    </div>
                    <input id="dropzone-file" type="file" class="hidden" />
                </label>
            </div> 
            <div class="panel">
                Pipeline legos
            </div>
        </section>
        <section class="flex flex-col gap-4">
            <div class="panel">Metadata</div>
            <div class="panel">analysis results</div>
        </section>

    </div>
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-[100%] max-w-4/5 lg:max-w-3/5 h-20 bg-slate-900 rounded-2xl">
        Floating bottom panel
    </div>
    <footer>
        <div class="text-center text-xs mt-4">
            <span>© 2025 Powered by <a href="https://svelte.dev/">Svelte</a></span>
            <span>:: Developed by ydderf <a class="italic" href="https://github.com/yydderf/malexpert-page">(page src)</a></span>
            <span></span>
        </div>
    </footer>
</div>
