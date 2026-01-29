<script lang="ts">
import { Popover } from "bits-ui";
import { typewriter } from "$lib/actions/typewriter.js";
import { TYPEWRITER } from "$lib/consts/typewriter.ts";
import { MEDIA_SIZES } from "$lib/consts/media.ts";
import { THEME } from "$lib/consts/style.ts";
import { MediaQuery } from "svelte/reactivity";
import Info from "phosphor-svelte/lib/Info";

let {
    delayDuration: delay_duration,
    item,
    type = "normal",
    zval = $bindable(false),
} = $props<{
    delayDuration: number;
    item: unknown;
    type: "title" | "normal";
    zval: boolean
}>();

const is_mobile = new MediaQuery(MEDIA_SIZES.MD);
const icon_style = type === "title" ? "fill-accent dark:fill-dark-accent" : "fill-foreground dark:fill-dark-foreground";
// let zval = $state(false);
</script>

<Popover.Root delayDuration={200} onOpenChange={(o) => {
    zval = o;
}}>
    <Popover.Trigger openOnHover>
        <!-- <Info color={icon_color}/> -->
        <Info class="{icon_style} relative z-{zval ? 100 : 0}" />
    </Popover.Trigger>
    <Popover.Portal>
        <Popover.Overlay class="
            animate-appear animate-destroy
            fixed inset-0 z-50 bg-black/80"
        />
        <Popover.Content
            side={is_mobile.current ? "bottom" : "right"} sideOffset={6}
            class="animate-appear animate-destroy animate-direction
            border-accent dark:border-dark-accent rounded-2xl
            bg-background dark:bg-dark-background z-50
            flex items-center justify-center p-4
            ">
            <div class="brightness-80 wrap-normal max-w-xs">
                <p class="text-xs whitespace-pre-wrap"
                    use:typewriter={{
                        text: `${item.help ?? "help message is not set for this item"}`,
                        speed: TYPEWRITER.BASE_SPEED / 10,
                        delay: 0,
                    }}
                ></p>
            </div>
            <Popover.Close />
            <Popover.Arrow />
        </Popover.Content>
    </Popover.Portal>
</Popover.Root>
