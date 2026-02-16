<script lang="ts">
import { type DetectorResult } from "$lib/consts/api.ts"
import { Progress } from "bits-ui";
import { FIXED_DIGITS } from "$lib/consts/analysis.ts";
let {
    result,
    name,
} = $props<{
    result: DetectorResult;
    name: string;
}>();

const benign_prob = $derived(result != null ? result?.benign_prob : 0);
const malicious_prob = $derived(result != null ? result?.malicious_prob : 0);

const benign_disp = $derived(benign_prob != 0 ? (benign_prob * 100).toFixed(FIXED_DIGITS) : "");
const malicious_disp = $derived(malicious_prob != 0 ? (malicious_prob * 100).toFixed(FIXED_DIGITS) : "");

</script>

<div class="pb-4 flex flex-col">
    <div class="pb-4">
        Malicious Probability: {malicious_disp}% (Benign Probability: {benign_disp}%)
    </div>
    <div class="flex flex-row min-w-0 items-center gap-2">
        MalProb
        <Progress.Root max={1}
            class="bg-accent/30 dark:bg-dark-accent/30
            w-full h-[8px] rounded-2xl
            overflow-hidden"
        >
            <!-- TODO: Add information on how the augmentation was conducted?-->
            <div class="
                bg-red-400
                h-full w-full rounded-2xl"
                style={`transform: translateX(-${benign_prob * 100}%)`}
            >
            </div>
        </Progress.Root>
        {malicious_disp}%
    </div>
</div>


