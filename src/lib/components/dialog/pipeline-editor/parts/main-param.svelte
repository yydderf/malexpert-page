<script lang="ts">
import { pipeline } from "$lib/stores/pipeline.ts";
import { Select } from "bits-ui";
import { buttonVariants } from "$lib/components/button/index.ts";
import TipButton from "./tip-button.svelte";
import { MEDIA_SIZES } from "$lib/consts/media.ts";
import { MediaQuery } from "svelte/reactivity";
import { capitalizeFirst } from "$lib/common/string.js";

import Check from "phosphor-svelte/lib/Check";
import Palette from "phosphor-svelte/lib/Palette";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";

const { catalog, user_selections } = pipeline;

let {
    currentStage: current_stage,
} = $props<{
    currentStage?: PipelineStageName | null;
}>();

const themes = [
    { value: "light-monochrome", label: "Light Monochrome" },
    { value: "dark-green", label: "Dark Green" },
    { value: "svelte-orange", label: "Svelte Orange" },
    { value: "punk-pink", label: "Punk Pink" },
];

const param_selections = $derived.by(() => {
    const param_spec = current_stage === null ? {} : $catalog.stages?.[current_stage]?.params;
    return Object.entries(param_spec).map(([param, spec]) => ({
        name: param, label: capitalizeFirst(param.replaceAll("_", " ")), help: spec.help,
    }));
});

let value = $state<string>("");
const selectedLabel = $derived(
    value
        ? themes.find((theme) => theme.value === value)?.label
        : "Select a theme"
);

const is_mobile = new MediaQuery(MEDIA_SIZES.MD);

</script>

<div class="flex flex-col items-center gap-2">
    <div class="flex flex-col justify-center items-center gap-4 py-2 mt-4">
        {#if param_selections.length}
            {#each param_selections as item, idx } <!-- ModelInfo { name, help } -->
                <Select.Root type="single" onValueChange={(v) => (value = v)} items={themes} allowDeselec={true}>
                    <Select.Trigger 
                        class="
                        {buttonVariants({ variant: "ghost" })} active:scale-[0.98]
                        h-input rounded-2xl w-[40vw] max-w-2xs min-w-2xs
                        inline-flex touch-none select-none items-center
                        text-sm transition-colors"
                        aria-label={item.name}
                    >
                        <Palette class="text-muted-foreground mr-[9px] size-6" />
                        {selectedLabel}
                        <CaretUpDown class="text-muted-foreground ml-auto size-6" />
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Content
                            class="focus-override shadow-popover outline-hidden
                            bg-background/85 dark:bg-dark-background/85
                            animate-appear animate-destroy animate-direction
                            border border-accent dark:border-dark-accent rounded-2xl
                            z-50 h-96 max-h-[var(--bits-select-content-available-height)]
                            w-[var(--bits-select-anchor-width)]
                            min-w-[var(--bits-select-anchor-width)]
                            select-none px-1 py-3"
                            sideOffset={0}
                            side={is_mobile.current ? "bottom" : "right"}
                        >
                            <Select.ScrollUpButton class="flex w-full items-center justify-center">
                                <CaretDoubleUp class="size-3" />
                            </Select.ScrollUpButton>
                            <Select.Viewport class="p-1">
                                {#each themes as theme, i (i + theme.value)}
                                    <Select.Item
                                        class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize"
                                        value={theme.value}
                                        label={theme.label}
                                        disabled={theme.disabled}
                                    >
                                        {#snippet children({ selected })}
                                            {theme.label}
                                            {#if selected}
                                                <div class="ml-auto">
                                                    <Check aria-label="check" />
                                                </div>
                                            {/if}
                                        {/snippet}
                                    </Select.Item>
                                {/each}
                            </Select.Viewport>
                            <Select.ScrollDownButton class="flex w-full items-center justify-center">
                                <CaretDoubleDown class="size-3" />
                            </Select.ScrollDownButton>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
            {/each}
        {:else}
            <p>There's no selectable params</p>
        {/if}
    </div>
</div>
