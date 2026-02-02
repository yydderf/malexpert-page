<script lang="ts">
import { Progress } from "bits-ui";
import { fade } from "svelte/transition";
import { pipeline } from "$lib/stores/pipeline.ts";
import { runner } from "$lib/stores/runner.ts";
import { toast } from "svelte-sonner";
import { EVENTS } from "$lib/consts/api.ts";

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
    console.log($runner.status);
});

</script>

<div>
    {#if ($ready && $runner.status !== EVENTS.STATUS.DONE)}
        <button transition:fade={{ duration: 200 }}
            type="button" class="
            relative
            w-full h-24
            border-dashed
            selectable-border-region button-general
            animate-in fade-in-5 zoom-in-95
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
    {/if}
</div>
