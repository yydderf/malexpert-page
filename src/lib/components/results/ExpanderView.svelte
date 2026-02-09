<script lang="ts">
import { type ExpanderResult } from "$lib/consts/api.ts"
import { IMPORT_TABLE_COLUMNS } from "$lib/components/data-tables/import-data-table/columns.ts";
import DataTable from "$lib/components/data-tables/import-data-table/data-table.svelte";
import { Progress } from "bits-ui";

let {
    result,
    name,
} = $props<{
    result: ExpanderResult;
    name: string;
}>();

const orig_func_cnt = $derived(result !== null ? result?.orig_func : 0);
const expd_func_cnt = $derived(result !== null ? result?.expd_func : 0);
const expded_df = $derived(result != null ? result?.expded_df : [] ?? []);

</script>

<div class="pb-4 flex flex-col">
    <DataTable rows={expded_df} columns={IMPORT_TABLE_COLUMNS} class="pb-4"/>
    <div class="py-4 space-y-2 border-t border-gray-700 border-dashed">
        <div>
            Original Functions: {orig_func_cnt} | Expanded Functions: {expd_func_cnt}
        </div>
        <div>
            Expansion Factor: {`${((expd_func_cnt / orig_func_cnt) * 100).toFixed(1)}%` ?? 0}
        </div>
    </div>
    <div class="flex flex-row min-w-0 items-center gap-2">
        Orig
        <Progress.Root max={expd_func_cnt}
            class="bg-accent/20 dark:bg-dark-accent/20
            w-full h-[8px] rounded-2xl
            overflow-hidden"
        >
            <!-- TODO: Add information on how the expansion was done, xrefs, etc. -->
            <div class="
                bg-accent/30 dark:bg-dark-accent/30
                h-full w-full rounded-2xl"
                style={`transform: translateX(-${(1 - ((orig_func_cnt ?? 0) / expd_func_cnt)) * 100}%)`}
            >
            </div>
        </Progress.Root>
        Expd
    </div>
</div>


