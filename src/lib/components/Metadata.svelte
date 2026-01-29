<script lang="ts">

import type { MetaJson, MetadataLines } from "$lib/consts/meta.ts";
import { shortenName, ShortenMode } from "$lib/common/string.js";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER, BULLET_POINT } from "$lib/consts/typewriter.ts";
import { HELP_MSG } from "$lib/consts/meta.ts";
import InfoPopover from "$lib/components/InfoPopover.svelte";

let {
    currentMeta: current_meta,
} = $props<{
    currentMeta: MetaJson;
}>();

const meta_lines: MetadataLines = $derived(current_meta
    ? [
        { label: "Size",        value: current_meta.size },
        { label: "Hash",        value: shortenName(current_meta.sha256_hash, 10, ShortenMode.PREFIX_SUFFIX) , help: HELP_MSG.HASH},
        { label: "Arch",        value: `${current_meta.arch} ${current_meta.bitness}-bit` },
        { label: "Type",        value: current_meta.exec_type },
        { label: "Entropy",     value: current_meta.entropy, help: HELP_MSG.ENTROPY(current_meta.entropy)},
        { label: "Endianness",  value: current_meta.endianness }
    ]
    : []);

let finished_lines = $state<Map<string, boolean> | null>(null);
let zvals = $state<boolean[] | null>(null);

$effect(() => {
    finished_lines = Object.entries(
        meta_lines.map((l) => [ l.label, false ] as [string, boolean][])
    );
    zvals = Array(meta_lines.length).fill(false);
});

</script>
<div class="
    {current_meta ? "h-auto" : ""}
    transition-all duration-1000
    ">
    {#each meta_lines as item, i (item.label)}
        <div class="flex flex-row gap-2">
            <p use:typewriter={{
                text: `${BULLET_POINT}${item.label}: ${item.value}`,
                speed: TYPEWRITER.BASE_SPEED,
                delay: TYPEWRITER.BASE_DELAY * i,
                onDone: () => { finished_lines[item.label] = true; }
            }}
                class="relative z-{zvals[i] ? 100 : 0}"
            ></p>
            {#if item.help && finished_lines?.[item.label]}
                <InfoPopover delayDuration={200} item={item} type="normal" bind:zval={zvals[i]} />
            {/if}
        </div>
    {/each}
</div>

