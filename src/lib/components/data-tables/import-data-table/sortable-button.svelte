<script lang="ts">
import ArrowsDownUp from "phosphor-svelte/lib/ArrowsDownUp";
import { Button } from "$lib/components/button/index.ts";

let { 
    variant = "ghost",
    label = "",
    showIcon: show_icon = true,
    class: className = "",
    ...restProps
} = $props<{
    label?: string;
    variant?: string;
    showIcon?: boolean;
    class?: string;
    [key: string]: any;
}>();

</script>

<Button
    variant={variant}
    size="sm"
    class={`active:scale-[0.90] ${className}`}
    {...restProps}
>
    {label}
    {#if show_icon}
        <ArrowsDownUp />
    {/if}
</Button>
