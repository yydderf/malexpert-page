<script lang="ts">
import { type AugmentorResult } from "$lib/consts/api.ts"
import { Progress } from "bits-ui";
let {
    result,
    name,
} = $props<{
    result: AugmentorResult;
    name: string;
}>();

const total_embed = $derived(result !== null ? result?.total_embed : 0);
const null_embed_before = $derived(result != null ? result?.null_embed_before : 0);
const null_embed_after = $derived(result != null ? result?.null_embed_after : 0);

const n_augmented = $derived(result != null ? null_embed_before - null_embed_after: 0);

const aug_cov_pct = ((n_augmented / null_embed_before) * 100).toFixed(1) ?? 0;
const aug_cov_detail = `Augmentation Coverage: ${aug_cov_pct}%`

</script>

<div class="pb-4 flex flex-col">
    <div class="space-y-2">
        <div>
            Total Embed Before: {total_embed}
        </div>
        <div>
            Null Embed Before: {null_embed_before} | Null Embed After: {null_embed_after}
        </div>
        <div>
        </div>
    </div>
    <div class="flex flex-row min-w-0 items-center gap-2" title={aug_cov_detail}>
        AugCov
        <Progress.Root max={null_embed_before}
            class="bg-accent/30 dark:bg-dark-accent/30
            w-full h-[8px] rounded-2xl
            overflow-hidden"
        >
            <!-- TODO: Add information on how the augmentation was conducted?-->
            <div class="
                bg-accent dark:bg-dark-accent
                h-full w-full rounded-2xl"
                style={`transform: translateX(-${(1 - ((n_augmented) / null_embed_before)) * 100}%)`}
            >
            </div>
        </Progress.Root>
        {aug_cov_pct}%
    </div>
</div>
