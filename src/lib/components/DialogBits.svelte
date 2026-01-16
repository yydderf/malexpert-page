<script lang="ts">
import { Dialog, Separator } from "bits-ui";
import { fade } from "svelte/transition";
import { FADE_DURATION } from "$lib/consts/dialog.ts";
import { derived } from "svelte/store";
import { onMount } from "svelte";
import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
import Minus from "phosphor-svelte/lib/Minus";
import Plus from "phosphor-svelte/lib/Plus";
import XIcon from "phosphor-svelte/lib/X";
import Button from "$lib/components/Button.svelte";
import Tooltip from "$lib/components/Tooltip.svelte";
import StepChip from "$lib/components/StepChip.svelte";
import Pill from "$lib/components/Pill.svelte";
import { pipeline } from "$lib/stores/pipeline.ts";

const { 
    user_selections,
    catalog, allowedStages,
    getParams,
    setNextStage, setModel, setParam
} = pipeline;

let {
    dialogTitle: dialog_title = "title",
    dialogTrigger: dialog_trigger = "trigger",
    dialogDescription: dialog_description = null,
    dialogStage: dialog_stage = null,
    dialogIndex: dialog_index = null,
} = $props<{
    dialogTitle?: string;
    dialogTrigger?: string;
    dialogDescription?: string | null;
    dialogStage?: PipelineStageName | null;
    dialogIndex?: number | null;
}>();

type Step = "stage" | "model" | "params";
let step = $state<Step>("stage");
let dialogOpened = $state(false);
let chosen_stage = $state<PipelineStageName | null>(null);
let chosen_model = $state<string | null>(null);

onMount(() => {
    if (dialog_stage !== null) {
        chosen_stage = dialog_stage;
        step = "model";
    }
    $inspect(`dialog ${dialog_stage} is created`);
});

const stage_selections = $allowedStages(dialog_index).map((st) => ({
    stage: st, description: $catalog.stages?.[st]?.description ?? "",
}));

const model_selections = $derived.by(() => {
    if (chosen_stage) return $catalog.stages?.[chosen_stage]?.models;
    return [];
});

const param_selections = $derived.by(() => {
    const param_spec = chosen_stage === null ? {} : $catalog.stages?.[chosen_stage]?.params;
    const result = Object.entries(param_spec).map(([param, spec]) => ({
        name: param, help: spec.help,
    }));
    return result;
});

$inspect($user_selections);

</script>

<Dialog.Root onOpenChange={() => dialogOpened = true}>
    <Dialog.Trigger asChild>
        <button type="button" class="
            relative
            w-full h-24
            border-dashed
            selectable-border-region
            hover:bg-white/1 active:scale-[0.98]
            "
        >
            {dialog_trigger}
            {#if !dialogOpened}
                <span class="
                    absolute top-0 right-0 w-6 h-6
                    border-2 border-current rounded-2xl
                    [clip-path:polygon(50%_0,100%_0,100%_50%,50%_50%)]
                    "></span>
                <span class="
                    absolute top-0 right-0 w-6 h-6
                    border-2 border-current rounded-2xl
                    [clip-path:polygon(50%_0,100%_0,100%_50%,50%_50%)]
                    motion-safe:animate-ping
                    "></span>
            {/if}
        </button>
    </Dialog.Trigger>
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
            <div class="grid max-h-[80vh] grid-rows-[auto_1fr_auto]">
                <header>
                    <Dialog.Title class="text-accent dark:text-dark-accent">{dialog_title}</Dialog.Title>
                    <Dialog.Description class="text-xs">
                        {dialog_description}
                    </Dialog.Description>
                    <div class="mt-3 flex items-center gap-2 text-xs pb-2">
                        <StepChip active={step === "stage"}>Stage</StepChip>
                        <span class="opacity-40"></span>
                        <StepChip active={step === "model"}>Model</StepChip>
                        <span class="opacity-40"></span>
                        <StepChip active={step === "params"}>Params</StepChip>
                    </div>
                    <!--
                    <div class="mt-3 flex flex-wrap gap-2">
                        {#if chosenStage}<Pill>{chosenStage}</Pill>{/if}
                        {#if chosenModel}<Pill>{chosenModel}</Pill>{/if}
                    </div> -->
                </header>
                <main>
                    {#key step}
                        <!-- <div in:fade={{ duration: FADE_DURATION.IN }} out:fade={{ duration: FADE_DURATION.OUT }}> -->
                        <div>
                            {#if step === "stage"}
                                <div class="flex flex-col items-center gap-2">
                                    <div class="flex flex-row justify-center items-center gap-2 py-2 mt-4">
                                        {#each stage_selections as item, idx }
                                            {#if idx > 0}<span class="opcaity-40 px-1">::</span>{/if}
                                            <Tooltip buttonTitle={item.stage}
                                                buttonDescription={item.description}
                                                tipside="top"
                                                onClickFunc={() => {
                                                    chosen_stage = item.stage;
                                                    step = "model";
                                                    setNextStage(item.stage);
                                                }}
                                            >
                                            </Tooltip>
                                        {/each}
                                    </div>
                                </div>
                            {:else if step === "model"}
                                <div class="flex flex-col items-center gap-2">
                                    <div class="flex flex-row justify-center items-center gap-2 py-2 mt-4">
                                        {#each model_selections as item, idx } <!-- ModelInfo { name, help } -->
                                            {#if idx > 0}<span class="opcaity-40 px-1">::</span>{/if}
                                            <Tooltip buttonTitle={item.name}
                                                buttonDescription={item.help}
                                                tipside="top"
                                                onClickFunc={() => {
                                                    chosen_model = item.name;
                                                    step = "params";
                                                    setModel(chosen_stage, item.name);
                                                }}
                                            >
                                            </Tooltip>
                                        {/each}
                                    </div>
                                </div>
                            {:else}
                                <div class="flex flex-col items-center gap-2">
                                    <div class="flex flex-row justify-center items-center gap-2 py-2 mt-4">
                                        {#each param_selections as item, idx } <!-- ModelInfo { name, help } -->
                                            {#if idx > 0}<span class="opcaity-40 px-1">::</span>{/if}
                                            <Tooltip buttonTitle={item.name}
                                                buttonDescription={item.help}
                                                tipside="top"
                                                onClickFunc={() => {
                                                }}
                                            >
                                            </Tooltip>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/key}
                </main>
                <footer class="border-t border-accent dark:border-dark-accent">
                    <div class="flex flex-col items-center gap-2 pt-2">
                        <div class="flex flex-row justify-space-between items-center gap-2">
                            <Tooltip buttonTitle=""
                                buttonDescription="cancel and go back"
                                tipside="bottom"
                            >
                                {#snippet triggerIcon()}
                                    <ArrowLeft />
                                {/snippet}
                            </Tooltip>
                            <span class="opcaity-40 px-1">::</span>
                            <Tooltip buttonTitle=""
                                buttonDescription="clear the selection"
                                tipside="bottom"
                            >
                                {#snippet triggerIcon()}
                                    <Minus />
                                {/snippet}
                            </Tooltip>
                            <span class="opcaity-40 px-1">::</span>
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
                </footer>
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
