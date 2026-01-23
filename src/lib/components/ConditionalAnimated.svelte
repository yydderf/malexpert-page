<script lang="ts">
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER } from "$lib/consts/typewriter.ts";
let {
    text = null,
    speed = TYPEWRITER.BASE_SPEED,
    delay = TYPEWRITER.BASE_DELAY,
    class: className = "",
    onDone,
} = $props<{
    text?: string | null;
    speed?: number;
    delay?: number;
    class?: string;
    onDone?: () => void | null;
}>();
</script>

{#if text}
    <div use:typewriter={{ text, speed, delay, onDone: onDone }} class={className}></div>
{:else}
    <div class={className}></div>
{/if}
