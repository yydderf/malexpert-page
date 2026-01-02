<script>
let file = null;
let dragging = null;
let uploading = false;
let error = null;
let result = null;
const api = "http://10.0.1.3:8000"

function shortenName(name) {
    if (!name || name.length <= 20) return name;
    return name.slice(0, 10) + "..." + name.slice(-10);
}

async function uploadFile() {
    console.log("uploadFile");
    if (!file || uploading) return;

    uploading = true;
    error = null;
    result = null;

    try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch(api + "/samples/upload/form", {
            method: "POST",
            body: form,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `Upload failed: ${res.status} ${res.statusText}`);
        }

        const ct = res.headers.get("content-type") || "";
        result = ct.includes("application/json") ? await res.json() : await res.text();
    } catch (e) {
        error = e?.message ?? String(e);
    } finally {
        uploading = false;
    }
}

async function onDrop(e) {
    console.log("onDrop");
    e.preventDefault();
    dragging = false;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    file = files[0];
    await uploadFile();
}

async function onPick(e) {
    console.log("onPick");
    const input = e.currentTarget;
    const files = input.files;
    if (!files || files.length === 0) return;
    file = files[0];
    await uploadFile();
}

function onDragOver(e) {
    console.log("onDragOver");
    e.preventDefault();
    dragging = true;
}

function onDragLeave() {
    console.log("onDragLeave");
    e.preventDefault();
    dragging = false;
}

</script>

<div class="flex items-center justify-center w-full">
    <label for="dropzone-file" class="
        w-full
        {result ? 'h-24 border-accent dark:border-dark-accent' : 'h-64 border-dashed' }
        flex flex-col items-center justify-center
        bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium
        border border-default-strong rounded-2xl
        cursor-pointer
        transition-all duration-1000
        "
        on:drop={onDrop}
        on:dragover={onDragOver}
        on:dragleave={onDragLeave}
    >
        {#if uploading}
            <p class="mb-2 text-sm"><span class="font-semibold">Uploading...</span></p>
        {:else if file}
            <p class="mb-2 text-sm"><span class="font-semibold">Filename: </span>{shortenName(file.name)}</p>
            <p class="text-xs">({Math.round(file.size / 1024)} KB)</p>
        {:else}
            <div class="flex flex-col items-center justify-center text-body pt-5 pb-6">
                <svg class="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/></svg>
                <p class="mb-2 text-sm"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                <p class="text-xs">.exe or ELF (max 50MiB)</p>
            </div>
            <input id="dropzone-file" type="file" class="hidden" accept=".exe,.elf,application/x-executable,application/octet-stream" on:change={onPick}/>
        {/if}
        {#if error}
            <p class="mt-2 text-sm text-red-400">{error}</p>
        {/if}
    </label>
</div> 
