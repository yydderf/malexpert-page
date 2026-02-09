<script lang="ts">
import { type EncoderResult } from "$lib/consts/api.ts"
import { Progress } from "bits-ui";
let {
    result,
    name,
} = $props<{
    result: EncoderResult;
    name: string;
}>();

const tot_func_cnt = $derived(result !== null ? result?.total_func : 0);
const imp_func_cnt = $derived(result !== null ? result?.encoded_func : 0);

</script>

<div class="pb-4 flex flex-col">
    <div class="pb-4 space-y-2">
        <div>
            Total Function: {tot_func_cnt} | Imported Function: {imp_func_cnt}
        </div>
        <div>
            Encoding Ratio: {`${((imp_func_cnt / tot_func_cnt) * 100).toFixed(1)}%` ?? 0}
        </div>
    </div>
    <div class="flex flex-row min-w-0 items-center gap-2">
        Encoded
        <Progress.Root max={tot_func_cnt}
            class="bg-accent/30 dark:bg-dark-accent/30
            w-full h-[8px] rounded-2xl
            overflow-hidden"
        >
            <!-- TODO: Add onhover -->
            <!-- TODO: Add information on Imported Function: how does the matrix look like -->
            <div class="
                bg-accent dark:bg-dark-accent
                h-full w-full rounded-2xl"
                style={`transform: translateX(-${tot_func_cnt - (imp_func_cnt ?? 0)}%)`}
            >
            </div>
        </Progress.Root>
        NullEmb
    </div>
</div>
