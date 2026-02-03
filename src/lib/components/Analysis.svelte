<script lang="ts">
import { Progress, Accordion } from "bits-ui";
import { fade } from "svelte/transition";
import { pipeline } from "$lib/stores/pipeline.ts";
import { runner } from "$lib/stores/runner.ts";
import { toast } from "svelte-sonner";
import { EVENTS } from "$lib/consts/api.ts";
import CaretDown from "phosphor-svelte/lib/CaretDown";

let { registerJob } = runner;
let { ready, user_selections } = pipeline;
let {
    started = $bindable(false),
    sampleId: sample_id,
} = $props<{
    sampleId: string | null;
    started: boolean;
}>();

$effect(() => {
    $inspect(`${$runner.stage}: ${$runner.status}`);
});

const items = [
    {
        value: "1",
        title: "What is the meaning of life?",
        content:
        "To become a better person, to help others, and to leave the world a better place than you found it."
    },
    {
        value: "2",
        title: "How do I become a better person?",
        content:
        "Read books, listen to podcasts, and surround yourself with people who inspire you."
    },
    {
        value: "3",
        title: "What is the best way to help others?",
        content: "Give them your time, attention, and love."
    }
];


</script>

<div>
    {#if $ready }
        {#if $runner.status !== EVENTS.STATUS.DONE}
            <button transition:fade={{ duration: 200 }}
                type="button" class="
                relative
                w-full
                {$runner.status === EVENTS.STATUS.DONE ? "h-0" : "h-24"}
                border-dashed
                selectable-border-region button-general
                animate-in fade-in-5 zoom-in-95
                transition-all duration-100
                "
                onclick={() => {
                    if (sample_id !== null && !started) {
                        started = true;
                        toast.promise(
                            registerJob(sample_id, user_selections),
                            {
                                loading: "Submitting job...",
                                success: "Job started successfully",
                                error: "Failed to start job",
                            }
                        );
                    }
                }}
            >
                <div>
                    {$runner.status === EVENTS.STATUS.NOT_STARTED ? "Start Analyzing..." : `At Stage: ${$runner.stage}`}
                </div>
            </button>
        {:else}
            <!-- accordion of each stage slide in from left -->
            <div transition:fade={{ duration: 2000 }}>
                <Accordion.Root class="w-full border-t border-gray-500" type="multiple">
                    {#each items as item (item.value)}
                        <Accordion.Item
                            value={item.value}
                            class="
                            border-gray-500 group border-b px-1.5
                            animate-in fade-in-100
                            "
                        >
                            <Accordion.Header>
                                <Accordion.Trigger
                                    class="flex w-full flex-1 items-center justify-between
                                    select-none py-5 font-xs
                                    transition-all [&[data-state=open]>span>svg]:rotate-180"
                                >
                                    <span class="w-full text-left">
                                        {item.title}
                                    </span>
                                    <span
                                        class="hover:bg-dark-10 inline-flex size-8
                                        items-center justify-center rounded-2xl
                                        bg-transparent"
                                    >
                                        <CaretDown class="size-[18px] transition-transform duration-200" />
                                    </span>
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content
                                class="
                                data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down
                                overflow-hidden text-xs tracking-[-0.01em]"
                            >
                                <div class="pb-[25px]">
                                    {item.content}
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    {/each}
                </Accordion.Root>
            </div>
        {/if}
    {/if}
</div>
