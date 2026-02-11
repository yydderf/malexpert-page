<script lang="ts">
import { onDestroy } from "svelte";
import { ForceGraph } from "$lib/components/graph/forceGraph.js";
import { type Graph } from "$lib/consts/api.ts";

let {
    graph,
    width = 640,
    height = 400,
} = $props<{
    graph: Graph,
    width: number,
    height: number,
}>();

let container = HTMLDivElement;

let stop_prev: null | (() => void) = null;

function cloneGraph(g: Graph): Graph {
    return typeof structuredClone === "function"
        ? structuredClone(g)
        : { nodes: g.nodes.map(n => ({ ...n })), links: g.links.map(l => ({ ...l })) };
}

function render() {
    if (!container) return;
    stop_prev?.();
    stop_prev = null;
    let resolve_stop!: () => void;
    const invalidation = new Promise<void>((resolve) => (resolve_stop = resolve));
    stop_prev = resolve_stop;
    const g = cloneGraph(graph);
    const svg_node = ForceGraph(
        { nodes: g.nodes, links: g.links },
        { width, height, linkStrength: 0.4, invalidation }
    );
    container.replaceChildren(svg_node);
}

$effect(() => {
    graph; width; height;
    render();
});

onDestroy(() => {
    stop_prev?.();
});

</script>

<div class="w-full" bind:this={container}></div>
