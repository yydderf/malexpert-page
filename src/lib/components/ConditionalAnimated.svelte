<script lang="ts">
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER } from "$lib/consts/typewriter.ts";
let {
    text = null,
    speed = TYPEWRITER.BASE_SPEED,
    delay = TYPEWRITER.BASE_DELAY,
    class: className = ""
} = $props<{
    text?: string | null;
    speed?: number;
    delay?: number;
    class?: string;
}>();
</script>

{#if text}
    <div use:typewriter={{ text, speed, delay }} class={className}></div>
{:else}
    <div class={className}></div>
{/if}
