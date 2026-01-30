<script lang="ts">
import { type Snippet } from "svelte";
import ConditionalAnimated from "$lib/components/ConditionalAnimated.svelte";
import { SECTION_HELP_MSG } from "$lib/consts/page.ts";

let {
    sectionName: section_name,
    runIf,
    class: className = "",
    zval = false,
    embeddedComp: embedded_comp,
} = $props<{
    sectionName: string;
    runIf: boolean;
    class: string;
    zval: boolean;
    embeddedComp?: Snippet | null;
}>();

let animated_text_done = $state(false);

</script>

<div class="flex flex-row gap-2 {className} items-center">
    <ConditionalAnimated text={runIf ? section_name : null} class="panel-title relative z-{zval ? 100 : 0} shrink-0 whitespace-nowrap"
        onDone={() => { animated_text_done = true; }}
    />
    {#if animated_text_done}
        {@render embedded_comp?.()}
    {/if}
</div>
