<script lang="ts">
import { DropdownMenu } from "bits-ui";
import { Button } from "$lib/components/button/index.ts";
import DotsThree from "phosphor-svelte/lib/DotsThree";

let is_open = $state(false);

</script>

<DropdownMenu.Root bind:open={is_open}>
    <DropdownMenu.Trigger class="{buttonVariants({ variant: "ghost" })} active:scale-[0.90]" asChild>
        <button onclick={() => {
        }}
            <DotsThree />
        </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
        <DropdownMenu.Content>
            <DropdownMenu.Group>
                <DropdownMenu.Item onclick={() => navigator.clipboard.writeText(name)}>
                    Copy function name
                </DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>
