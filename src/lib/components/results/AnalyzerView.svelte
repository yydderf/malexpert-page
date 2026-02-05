<script lang="ts">
import { type AnalyzerResult } from "$lib/consts/api.ts";
import { IMPORT_TABLE_COLUMNS } from "$lib/components/data-tables/import-data-table/columns.ts";
import DataTable from "$lib/components/data-tables/import-data-table/data-table.svelte";
let {
    result,
    name,
} = $props<{
    result: AnalyzerResult;
    name: string;
}>();

const data = $derived(result !== null ? result?.imports : [] ?? []);

</script>

<div>
    <!-- library list: bullet points? -->
    <!-- import table: table with expandable button -->
    <DataTable rows={data} columns={IMPORT_TABLE_COLUMNS} />
    <!-- {name} -->
</div>
