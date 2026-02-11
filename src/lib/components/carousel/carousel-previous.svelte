<script lang="ts">
import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
import type { WithoutChildren } from "bits-ui";
import { getEmblaContext } from "./context.ts";
import { cn } from "$lib/common/utils.ts";
import { Button, type Props } from "$lib/components/button/index.ts";
let {
    ref = $bindable(null),
    class: className,
    variant = "ghost",
    size = "icon",
    ...restProps
}: WithoutChildren<Props> = $props();
const emblaCtx = getEmblaContext("<Carousel.Previous/>");
</script>
<Button
    data-slot="carousel-previous"
    {variant}
    {size}
    aria-disabled={!emblaCtx.canScrollPrev}
    class={cn(
        "absolute size-8 rounded-full",
        emblaCtx.orientation === "horizontal"
            ? "-start-12 top-1/2 -translate-y-1/2"
            : "start-1/2 -top-12 -translate-x-1/2 rotate-90",
        className
    )}
    onclick={emblaCtx.scrollPrev}
    onkeydown={emblaCtx.handleKeyDown}
    {...restProps}
    bind:ref
>
    <ArrowLeft class="size-4" />
    <span class="sr-only">Previous slide</span>
</Button>
