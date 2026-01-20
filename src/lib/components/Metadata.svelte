<script lang="ts">

import type { MetaJson, MetadataLines } from "$lib/consts/meta.ts";
import { buttonVariants } from "$lib/components/button/index.ts";
import { shortenName, ShortenMode } from "$lib/common/string.js";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER, BULLET_POINT } from "$lib/consts/typewriter.ts";
import { HELP_MSG } from "$lib/consts/meta.ts";
import { MEDIA_SIZES } from "$lib/consts/media.ts";
import { Popover } from "bits-ui";
import { MediaQuery } from "svelte/reactivity";
import Info from "phosphor-svelte/lib/Info";

let {
    currentMeta: current_meta,
} = $props<{
    currentMeta: MetaJson;
}>();

const meta_lines: MetadataLines = $derived(current_meta
    ? [
        { label: "Size",        value: current_meta.size },
        { label: "Hash",        value: shortenName(current_meta.hash, 10, ShortenMode.PREFIX_SUFFIX) , help: HELP_MSG.HASH},
        { label: "Arch",        value: `${current_meta.arch} ${current_meta.bitness}-bit` },
        { label: "Type",        value: current_meta.exec_type },
        { label: "Entropy",     value: current_meta.entropy, help: HELP_MSG.ENTROPY(current_meta.entropy)},
        { label: "Endianness",  value: current_meta.endianness }
    ]
    : []);

let finished_lines = $state<Map<string, boolean> | null>(null);

$effect(() => {
    finished_lines = Object.entries(
        meta_lines.map((l) => [ l.label, false ] as [string, boolean][])
    );
});

// const is_mobile = mediaQuery(MEDIA_SIZES.MD);
const is_mobile = new MediaQuery(MEDIA_SIZES.MD);
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
            ></p>
            {#if item.help && finished_lines[item.label]}
                <Popover.Root delayDuration={200}>
                    <Popover.Trigger openOnHover>
                        <Info />
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Overlay class="
                            animate-appear animate-destroy
                            fixed inset-0 z-50 bg-black/80"
                        />
                        <Popover.Content
                            side={is_mobile.current ? "bottom" : "right"} sideOffset={6}
                            class="animate-appear animate-destroy animate-direction
                            border-accent dark:border-dark-accent rounded-2xl
                            bg-background dark:bg-dark-background z-50
                            flex items-center justify-center p-4
                            ">
                            <div class="brightness-80 wrap-normal max-w-xs">
                                <p class="text-xs whitespace-pre-wrap"
                                    use:typewriter={{
                                        text: `${item.help}`,
                                        speed: TYPEWRITER.BASE_SPEED / 10,
                                        delay: 0,
                                    }}
                                ></p>
                            </div>
                            <Popover.Close />
                            <Popover.Arrow />
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            {/if}
        </div>
    {/each}
</div>

