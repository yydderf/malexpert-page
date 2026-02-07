<script lang="ts">
import { type AnalyzerResult } from "$lib/consts/api.ts";
import { IMPORT_TABLE_COLUMNS } from "$lib/components/data-tables/import-data-table/columns.ts";
import { Collapsible } from "bits-ui";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import DataTable from "$lib/components/data-tables/import-data-table/data-table.svelte";
let {
    result,
    name,
} = $props<{
    result: AnalyzerResult;
    name: string;
}>();

const data = $derived(result !== null ? result?.imports : [] ?? []);
const libraries = $derived(result !== null ? result?.libraries : [] ?? []);

</script>

<div class="pb-4">
    <!-- library list: bullet points? -->
    <!-- import table: table with expandable button -->
    <!-- TODO: lib collapsible -->
    <!--
    <Collapsible.Root class="mb-4">
        <div class="flex items-center justify-between gap-4 pb-4">
            {#if libraries.length === 0 ?? 0}
                <span class="text-xs font-semibold">Sample did not import any libraries</span>
            {:else}
                <span class="text-xs">Sample imported {libraries.length ?? 0} {libraries.length > 1 ? "libraries" : "library"}</span>
            {/if}
            <Collapsible.Trigger>
                <CaretUpDown />
            </Collapsible.Trigger>
        </div>
        <Collapsible.Content hiddenUntilFound
            class="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up
            space-y-2 overflow-hidden text-[15px] tracking-[0.01em]">
            {#each libraries as lib}
                <div class="text-xs">
                    {lib}
                </div>
            {/each}
        </Collapsible.Content>
    </Collapsible.Root>
    -->
    <!-- TODO: 1. center each column 2. trim off lib name? -->
    <DataTable rows={data} columns={IMPORT_TABLE_COLUMNS} />
    <!-- {name} -->
</div>
