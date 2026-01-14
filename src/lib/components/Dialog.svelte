<script lang="ts">
import * as Dialog from "$lib/components/dialog/index.js";
import { type PageSelectionList } from "$lib/stores/pipeline.ts";

let {
    dialogTitle = "title",
    dialogTrigger = "trigger",
    dialogDescription = "description",
    selections = [],
} = $props<{
    dialogTitle?: string;
    dialogTrigger?: string;
    dialogDescription?: string;
    selections?: PageSelectionList;
}>();

$inspect(`Component: ${dialogTitle} | selections: ${selections.map(item => {
    return `${item.stage}-${item.description}`
}).join(', ')}`);
</script>

<Dialog.Root>
    <Dialog.Trigger class="
        w-full
        h-24
        border-dashed
        selectable-border-region
        ">
        {dialogTrigger}</Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>{dialogTitle}</Dialog.Title>
            <Dialog.Description>
                {dialogDescription}
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>
