<script lang="ts">
import { Button } from "$lib/components/button/index.ts";
let {
    buttonTitle: button_title,
    buttonDescription: button_description,
} = $props<{
    buttonTitle?: string;
    buttonDescription?: string;
}>();
</script>

<Button variant="ghost" class="
    w-auto h-auto
    border-accent dark:border-dark-accent
    ">
    <div class="flex flex-col items-center">
        {button_title}
        {#if button_description}
        <Button size="sm" variant="link">
            {button_description}
        </Button>
        {/if}
    </div>
</Button>
