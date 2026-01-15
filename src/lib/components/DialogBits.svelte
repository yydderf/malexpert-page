<script lang="ts">
import { Dialog, Separator } from "bits-ui";
import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
import Minus from "phosphor-svelte/lib/Minus";
import Plus from "phosphor-svelte/lib/Plus";
import XIcon from "phosphor-svelte/lib/X";
import Button from "$lib/components/Button.svelte";
import Tooltip from "$lib/components/Tooltip.svelte";
import { type PageSelectionList } from "$lib/stores/pipeline.ts";

let {
    dialogTitle: dialog_title = "title",
    dialogTrigger: dialog_trigger = "trigger",
    dialogDescription: dialog_description = null,
    selections = [],
} = $props<{
    dialogTitle?: string;
    dialogTrigger?: string;
    dialogDescription?: string | null;
    selections?: PageSelectionList;
}>();

$inspect(`Component: ${dialog_title} | selections: ${selections.map(item => {
    return `${item.stage}-${item.description}`
}).join(', ')}`);
</script>

<Dialog.Root>
    <Dialog.Trigger class="
        w-full h-24
        border-dashed
        selectable-border-region
        hover:bg-white/1 active:scale-[0.98]
        ">
        {dialog_trigger}</Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
        />
        <Dialog.Content class="
            bg-background dark:bg-dark-background
            border-accent dark:border-dark-accent
            rounded-2xl shadow-popover
            data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
            outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)]
            translate-x-[-50%] translate-y-[-50%] border p-5 sm:max-w-[490px] md:w-full
            ">
            <Dialog.Title class="text-accent dark:text-dark-accent">{dialog_title}</Dialog.Title>
            <Dialog.Description class="text-xs border-b border-accent dark:border-dark-accent pb-2">
                {dialog_description}
            </Dialog.Description>
            <div class="flex flex-col items-center gap-2">
                <div class="flex flex-row justify-center items-center gap-2
                    border-b border-accent dark:border-dark-accent py-2 mt-4">
                    {#each selections as item, idx }
                        <Tooltip buttonTitle={item.stage}
                            buttonDescription={item.description}
                            tipside="top"
                        >
                        </Tooltip>
                        {#if idx !== 0}
                            ::
                        {/if}
                    {/each}
                </div>
                <div class="flex flex-row justify-space-between items-center gap-2">
                    <Tooltip buttonTitle=""
                        buttonDescription="cancel and go back"
                        tipside="bottom"
                    >
                        {#snippet triggerIcon()}
                            <ArrowLeft />
                        {/snippet}
                    </Tooltip>
                    ::
                    <Tooltip buttonTitle=""
                        buttonDescription="clear the selection"
                        tipside="bottom"
                    >
                        {#snippet triggerIcon()}
                            <Minus />
                        {/snippet}
                    </Tooltip>
                    ::
                    <Tooltip buttonTitle=""
                        buttonDescription="save the configuration"
                        tipside="bottom"
                    >
                        {#snippet triggerIcon()}
                            <Plus />
                        {/snippet}
                    </Tooltip>
                </div>
            </div>
            <Dialog.Close
                class="
                focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden
                absolute right-5 top-5 rounded-md
                focus-visible:ring-2 focus-visible:ring-offset-2
                active:scale-[0.90]"
            >
                <div>
                    <XIcon />
                    <span class="sr-only">Close</span>
                </div>
            </Dialog.Close>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
