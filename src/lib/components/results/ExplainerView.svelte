<script lang="ts">
import { onMount } from "svelte";
import { type ExplainerResult } from "$lib/consts/api.ts";
import ForceGraphView from "$lib/components/graph/ForceGraphView.svelte";

let {
    result,
    name,
} = $props<{
    result: ExplainerResult;
    name: string;
}>();

const graph = $derived(result !== null ? result?.graph : { nodes: [], links: [] } as graph);

</script>

<div class="pb-4 flex flex-col">
    <ForceGraphView graph={graph} />
</div>
