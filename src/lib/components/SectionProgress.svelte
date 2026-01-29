<script lang="ts">
import ConditionalAnimated from "$lib/components/ConditionalAnimated.svelte";
let {
    sectionName: section_name,
    runIf,
    class: className = "",
} = $props<{
    sectionName: string;
    runIf: boolean;
    class: string;
}>();

let animated_text_done = $state(false);
</script>

<div class="flex flex-row gap-2 {className}">
</div>
