<script>
import * as Dialog from '$lib/components/dialog/index.js';
export let dialogTitle = "title";
export let dialogDescription = "description";
</script>

<Dialog.Root>
    <Dialog.Trigger class="
        w-full
        h-24
        border-dashed
        selectable-border-region
        ">
        {dialogTitle}</Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>{dialogTitle}</Dialog.Title>
            <Dialog.Description>
                {dialogDescription}
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>
