<script lang="ts">

import type { MetaJson, MetadataLines } from "$lib/consts/meta.ts";
import { shortenName, ShortenMode } from "$lib/common/string.js";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER, BULLET_POINT } from "$lib/consts/typewriter.ts";

let {
    currentMeta: current_meta,
} = $props<{
    currentMeta: MetaJson;
}>();

const meta_lines: MetadataLines = $derived(current_meta
    ? [
        { label: "Size",        value: current_meta.size },
        { label: "Hash",        value: shortenName(current_meta.hash, 10, ShortenMode.PREFIX_SUFFIX) },
        { label: "Arch",        value: `${current_meta.arch} ${current_meta.bitness}-bit` },
        { label: "Type",        value: current_meta.exec_type },
        { label: "Entropy",     value: current_meta.entropy },
        { label: "Endianness",  value: current_meta.endianness }
    ]
    : []);

</script>
<div class="
    {current_meta ? "h-auto" : ""}
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

