<script lang="ts">
import { type Snippet } from "svelte";
import { buttonVariants } from "$lib/components/button/index.ts";
import { Tooltip } from "bits-ui";
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
            animate-in fade-in-0 zoom-in-95
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
            data-[side=bottom]:slide-in-from-top-2
            data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2
            data-[side=top]:slide-in-from-bottom-2
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
