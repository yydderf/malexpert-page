<script lang="ts">
import { pipeline } from "$lib/stores/pipeline.ts";
import { runner } from "$lib/stores/runner.ts";

let { registerJob } = runner;
let { ready, user_selections } = pipeline;
let {
    currentId: current_id,
} = $props<{
    currentId: string | null;
}>();

let started = $state(false);

</script>

<div>
    {#if $ready}
        {#if !started}
            <button type="button" class="
                relative
                w-full h-24
                border-dashed
                selectable-border-region button-general
                animate-in fade-in-5 zoom-in-95
                "
                onclick={() => {
                    if (current_id !== null) {
                        started = true;
                        registerJob(current_id, user_selections);
                    }
                }}
            >
                Start Analyzing...
            </button>
        {:else}
        {/if}
    {/if}
</div>
