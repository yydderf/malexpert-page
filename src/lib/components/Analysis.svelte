<script lang="ts">
import { Progress } from "bits-ui";
import { pipeline } from "$lib/stores/pipeline.ts";
import { runner } from "$lib/stores/runner.ts";

let { registerJob } = runner;
let { ready, user_selections } = pipeline;
let {
    started = $bindable(false),
    sampleId: sample_id,
} = $props<{
    sampleId: string | null;
    started: boolean;
}>();

</script>

<div>
    {#if $ready}
        <button type="button" class="
            relative
            w-full h-24
            border-dashed
            selectable-border-region button-general
            animate-in fade-in-5 zoom-in-95
            "
            onclick={() => {
                if (sample_id !== null && !started) {
                    started = true;
                    registerJob(sample_id, user_selections);
                }
            }}
        >
            {#if !started}
                <div>
                    Start Analyzing...
                </div>
            {/if}
        </button>
    {/if}
</div>
