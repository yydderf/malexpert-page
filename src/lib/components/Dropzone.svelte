<script>
import { createEventDispatcher } from "svelte";
import { sampleUpload } from "$lib/stores/upload.js";
import { shortenName, ShortenMode } from "$lib/common/string.js";

const dispatch = createEventDispatcher();
let file = $state(null);
let dragging = $state(null);
let last_sample_id = null;

$effect(() => {
    const id = $sampleUpload.result?.sample_id;
    if (id && id !== last_sample_id) {
        last_sample_id = id;
        dispatch("uploaded", { sample_id: id });
    }
});

async function onDrop(e) {
    e.preventDefault();
    dragging = false;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    file = files[0];
    await sampleUpload.upload(file);
}

async function onPick(e) {
    const input = e.currentTarget;
    const files = input.files;
    if (!files || files.length === 0) return;

    file = files[0];
    await sampleUpload.upload(file);
}

function onDragOver(e) {
    e.preventDefault();
    dragging = true;
}

function onDragLeave() {
    e.preventDefault();
    dragging = false;
}

</script>

<div class="flex items-center justify-center w-full">
    <label for="dropzone-file" class="
        w-full
        {$sampleUpload.result ? 'h-24 border-accent dark:border-dark-accent' : 'h-64 border-dashed' }
        flex flex-col items-center justify-center
        bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium
        selectable-border-region button-general
        transition-[height] duration-1000
        "
        ondrop={onDrop}
        ondragover={onDragOver}
        ondragleave={onDragLeave}
    >
        {#if $sampleUpload.uploading}
            <p class="mb-2 text-xs"><span class="font-semibold">Uploading...</span></p>
        {:else if $sampleUpload.result}
            <p class="mb-2 text-xs"><span class="font-semibold">Filename: </span>{shortenName(file?.name ?? "", 10, ShortenMode.PREFIX_SUFFIX)}</p>
            <p class="text-xs">({Math.round(file?.size / 1024) ?? "unknown"} KB)</p>
            <input id="dropzone-file" type="file" class="hidden" accept=".exe,.elf,application/x-executable,application/octet-stream" onchange={onPick}/>
        {:else if $sampleUpload.error}
            <p class="mb-2 text-xs font-semibold text-red-400">{$sampleUpload.error.title}</p>
            <p class="text-xs text-red-400">{$sampleUpload.error.detail}</p>
        {:else}
            <div class="flex flex-col items-center justify-center text-body pt-5 pb-6">
                <svg class="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/></svg>
                <p class="mb-2 text-xs"><span class="font-semibold">Click</span> or <span class="font-semibold">drag and drop</span> to upload</p>
                <p class="text-xs">.exe or ELF (max 50MiB)</p>
            </div>
            <input id="dropzone-file" type="file" class="hidden" accept=".exe,.elf,application/x-executable,application/octet-stream" onchange={onPick}/>
        {/if}
    </label>
</div> 
