<script lang="ts">
import { Dialog } from "bits-ui";
import {
    StageDialogHeader,
    StageDialogMain,
    StageDialogFooter,
    StageDialogClose,
} from "$lib/components/dialog/pipeline-editor/parts";
import { EDITOR } from "$lib/consts/pipeline.ts";
import { pipeline, editor } from "$lib/stores/pipeline.ts";

const { user_selections, setLastStep } = pipeline;
const { closeEditor } = editor;

const current_index = $derived($editor.target?.kind === EDITOR.KINDS.EDIT ? $editor.target.index : null);
const current_selection = $derived(current_index == null ? null : $user_selections[current_index]);
const current_stage = $derived(current_selection?.stage ?? null);

$inspect(`current_index: ${current_index}`);
</script>

<Dialog.Root open={$editor.open}
    onOpenChangeComplete={(o) => {
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
                <StageDialogHeader 
                    currentIndex={current_index}
                    currentSelection={current_selection}
                    currentStage={current_stage}
                />
                <StageDialogMain
                    currentIndex={current_index}
                    currentSelection={current_selection}
                    currentStage={current_stage}
                />
                <StageDialogFooter />
            </div>
            <StageDialogClose />
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>

