<script lang="ts">
import { Dialog, Separator } from "bits-ui";
import { fade } from "svelte/transition";
import { FADE_DURATION } from "$lib/consts/dialog.ts";
import { EDITOR } from "$lib/consts/pipeline.ts";
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
import { capitalizeFirst } from "$lib/common/string.js";
import { pipeline, editor } from "$lib/stores/pipeline.ts";

const { 
    user_selections,
    catalog, allowedStages,
    getParams,
    setNextStage, setModel, setParam, setStage, setLastStep,
    descriptions: stage_descriptions,
} = pipeline;

const { closeEditor, setStep, setTarget } = editor;

let dialogOpened = $state(false);

const current_index = $derived($editor.target?.kind === EDITOR.KINDS.EDIT ? $editor.target.index : null);
const current_selection = $derived(current_index == null ? null : $user_selections[current_index]);
const current_stage = $derived(current_selection?.stage ?? null);

const dialog_title = $derived.by(() => {
    if (current_selection === null) return "Select the Next Stage";
    if ($editor.step === EDITOR.STEPS.STAGE) return "Select the Stage";
    return capitalizeFirst(current_stage);
});

const dialog_description = $derived(
    current_selection === null
        ? "Hover over the options to see the details"
        : $stage_descriptions[current_stage]
);

const stage_selections = $derived($allowedStages(current_index).map((st) => ({
    stage: st, description: $catalog.stages?.[st]?.description ?? "",
})));

$inspect(`current_index: ${current_index}`);

const model_selections = $derived(current_stage === null ? [] : $catalog.stages?.[current_stage]?.models);

const param_selections = $derived.by(() => {
    const param_spec = current_stage === null ? {} : $catalog.stages?.[current_stage]?.params;
    const result = Object.entries(param_spec).map(([param, spec]) => ({
        name: param, help: spec.help,
    }));
    return result;
});

</script>

<Dialog.Root open={$editor.open}
    onOpenChangeComplete={(o) => {
        dialogOpened = true;
        if (!o) {
            setLastStep(current_index, $editor.step);
            closeEditor();
        }
    }}
>
    <Dialog.Trigger />
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
                        <StepChip active={$editor.step === EDITOR.STEPS.STAGE}
                            onClickFunc={() => {
                                setStep(EDITOR.STEPS.STAGE);
                            }}
                        >
                            {#snippet chipName()}
                                Stage
                            {/snippet}
                        </StepChip>
                        <span class="opacity-40"></span>
                        <StepChip active={$editor.step === EDITOR.STEPS.MODEL}
                            disabled={current_selection === null}
                            onClickFunc={() => {
                                if (current_selection !== null) setStep(EDITOR.STEPS.MODEL);
                            }}
                        >
                            {#snippet chipName()}
                                Model
                            {/snippet}
                        </StepChip>
                        <span class="opacity-40"></span>
                        <StepChip active={$editor.step === EDITOR.STEPS.PARAM}
                            disabled={current_selection === null}
                            onClickFunc={() => {
                                if (current_selection !== null) setStep(EDITOR.STEPS.PARAM);
                            }}
                        >
                            {#snippet chipName()}
                                Params
                            {/snippet}
                        </StepChip>
                    </div>
                    <!--
                    <div class="mt-3 flex flex-wrap gap-2">
                        {#if chosenStage}<Pill>{chosenStage}</Pill>{/if}
                        {#if chosenModel}<Pill>{chosenModel}</Pill>{/if}
                    </div> -->
                </header>
                <main>
                    {#key $editor.step}
                        <!-- <div in:fade={{ duration: FADE_DURATION.IN }} out:fade={{ duration: FADE_DURATION.OUT }}> -->
                        <div>
                            {#if $editor.step === EDITOR.STEPS.STAGE}
                                <div class="flex flex-col items-center gap-2">
                                    <div class="flex flex-row justify-center items-center gap-2 py-2 mt-4">
                                        {#each stage_selections as item, idx }
                                            {#if idx > 0}<span class="opcaity-40 px-1">::</span>{/if}
                                            <Tooltip buttonTitle={item.stage}
                                                buttonDescription={item.description}
                                                tipside="top"
                                                selected={item.stage === current_stage}
                                                onClickFunc={() => {
                                                    if ($editor.target?.kind === EDITOR.KINDS.APPEND) {
                                                        setNextStage(item.stage);
                                                        setTarget({ kind: EDITOR.KINDS.EDIT, index: ($user_selections.length - 1) });
                                                    } else {
                                                        setStage(current_index, item.stage);
                                                    }
                                                    setStep(EDITOR.STEPS.MODEL);
                                                }}
                                            >
                                            </Tooltip>
                                        {/each}
                                    </div>
                                </div>
                            {:else if $editor.step === EDITOR.STEPS.MODEL}
                                <div class="flex flex-col items-center gap-2">
                                    <div class="flex flex-row justify-center items-center gap-2 py-2 mt-4">
                                        {#each model_selections as item, idx } <!-- ModelInfo { name, help } -->
                                            {#if idx > 0}<span class="opcaity-40 px-1">::</span>{/if}
                                            <Tooltip buttonTitle={item.name}
                                                buttonDescription={item.help}
                                                tipside="top"
                                                selected={item.name === current_selection?.selection?.model ?? false}
                                                onClickFunc={() => {
                                                    setModel(current_index, item.name);
                                                    setStep(EDITOR.STEPS.PARAM);
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
