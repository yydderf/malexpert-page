<script lang="ts">
import { type Snippet } from "svelte";
import { Tooltip } from "bits-ui";
import { buttonVariants } from "$lib/components/button/index.ts";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER } from "$lib/consts/typewriter.ts";

let { 
    buttonTitle: button_title,
    buttonDescription: button_description,
    tipside = "top",
    tipOffset: tip_offset = 0,
    triggerIcon: trigger_icon,
    selected = false,
    onClickFunc = null,
    delay = 200,
    children,
    snippet,
} = $props<{
    buttonTitle?: string;
    buttonDescription?: string;
    tipside?: "top" | "bottom" | "left" | "right";
    tipOffset?: number;
    delay?: number;
    triggerIcon?: Snippet | null;
    selected?: boolean;
    onClickFunc?: () => void | null;
}>();
</script>

<Tooltip.Provider ignoreNonKeyboardFocus>
    <Tooltip.Root delayDuration={delay}>
        <Tooltip.Trigger class="{buttonVariants({ variant: "ghost" })} active:scale-[0.90]" asChild>
            <button onclick={onClickFunc} class="{selected ? "underline" : ""}">
                {button_title}
                {#if trigger_icon}
                    {@render trigger_icon()}
                {/if}
            </button>
        </Tooltip.Trigger>
        <Tooltip.Content side={tipside} sideOffset={tip_offset} class="
            animate-appear
            animate-destroy
            animate-direction
            ">
            <div class="
                brightness-50
                ">
                <p use:typewriter={{
                    text: `${button_description}`,
                    speed: TYPEWRITER.BASE_SPEED / 1.5,
                    delay: 0,
                }}
                ></p>
            </div>
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>

