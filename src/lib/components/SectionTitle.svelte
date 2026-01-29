<script lang="ts">
import ConditionalAnimated from "$lib/components/ConditionalAnimated.svelte";
import InfoPopover from "$lib/components/InfoPopover.svelte";
import { SECTION_HELP_MSG } from "$lib/consts/page.ts";

let {
    sectionName: section_name,
    runIf,
    duration = 200,
    class: className = "",
} = $props<{
    sectionName: string;
    runIf: boolean;
    duration?: number | null;
    class: string;
}>();

let animated_text_done = $state(false);
let item = SECTION_HELP_MSG[section_name];
let zval = $state(false);

</script>

<div class="flex flex-row gap-2 {className}">
    <ConditionalAnimated text={runIf ? section_name : null} class="panel-title relative z-{zval ? 100 : 0}"
        onDone={() => { animated_text_done = true; }}
    />
    {#if animated_text_done && item.help}
        <InfoPopover duration={duration} item={item} type="title" bind:zval />
    {/if}
</div>
