<script lang="ts">
import { type Snippet } from "svelte";
let {
    active = false,
    disabled = false,
    chipName = "",
    onClickFunc = null,
} = $props<{
    active: boolean;
    disabled: boolean;
    chipName?: Snippet | null;
    onClickFunc?: () => void | null;
}>();
</script>

<!-- 
<span class={`rounded-full border px-2 py-1 ${active ? "border-accent text-accent" : "border-accent/40 text-accent/60"}`}>
</span>
-->

<button class="
    rounded-full border px-2 py-1
    {disabled ? "cursor-not-allowed" : "button-general"}
    {active ? "border-accent text-accent" : "border-accent/40 text-accent/60"}
    "
    onclick={onClickFunc}
>
    {#if chipName}
        {@render chipName()}
    {/if}
</button>

