<script lang="ts">
import { FIXED_DIGITS } from "$lib/consts/analysis.ts";
import { type EncoderResult } from "$lib/consts/api.ts";
import { Progress } from "bits-ui";
let {
    result,
    name,
} = $props<{
    result: EncoderResult;
    name: string;
}>();

const total_embed = $derived(result !== null ? result?.total_embed : 0);
const null_embed = $derived(result !== null ? result?.null_embed: 0);

</script>

<div class="pb-4 flex flex-col">
    <div class="pb-4 space-y-2">
        <div>
            Total Functions: {total_embed} | Imported Functions: {null_embed}
        </div>
        <div>
            Encoding Ratio: {`${(((total_embed - null_embed) / total_embed) * 100).toFixed(FIXED_DIGITS)}%` ?? 0}
        </div>
    </div>
    <div class="flex flex-row min-w-0 items-center gap-2">
        Encoded
        <Progress.Root max={total_embed}
            class="bg-accent/30 dark:bg-dark-accent/30
            w-full h-[8px] rounded-2xl
            overflow-hidden"
        >
            <!-- TODO: Add onhover -->
            <!-- TODO: Add information on Imported Function: how does the matrix look like -->
            <div class="
                bg-accent dark:bg-dark-accent
                h-full w-full rounded-2xl"
                style={`transform: translateX(-${((null_embed ?? 0) / total_embed) * 100}%)`}
            >
            </div>
        </Progress.Root>
        NullEmb
    </div>
</div>
