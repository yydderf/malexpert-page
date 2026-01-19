<script lang="ts">
import { Dialog } from "bits-ui";
import XIcon from "phosphor-svelte/lib/X";
</script>

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

