<script lang="ts" generics="TData, TValue">
import { type ColumnDef, type PaginationState, getCoreRowModel, getPaginationRowModel } from "@tanstack/table-core";
import { createSvelteTable, FlexRender } from "$lib/components/data-tables/parts/data-table/index.ts";
import * as Table from "$lib/components/data-tables/parts/table/index.ts";
import { Button } from "$lib/components/button/index.ts";
import { IMPORT_DATA_TABLE } from "$lib/consts/analysis.ts";

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    rows: TData;
};

let { rows, columns }: DataTableProps<TData, TValue> = $props();

let pagination = $state<PaginationState>({ pageIndex: IMPORT_DATA_TABLE.INIT_INDEX, pageSize: IMPORT_DATA_TABLE.PAGESIZE });

const table = createSvelteTable({
    get data() {
        return rows ?? [];
    },
    columns,
    state: {
        get pagination() {
            return pagination;
        },
    },
    onPaginationChange: (updater) => {
        if (typeof updater === "function") {
            pagination = updater(pagination);
        } else {
            pagination = updater;
        }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
});

</script>

<div>
    <div class="rounded-2xl border">
        <Table.Root>
            <Table.Header>
                {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                    <Table.Row>
                        {#each headerGroup.headers as header (header.id)}
                            <Table.Head colspan={header.colSpan} class="text-xs">
                                {#if !header.isPlaceholder}
                                    <FlexRender
                                        content={header.column.columnDef.header}
                                        context={header.getContext()}
                                    />
                                {/if}
                            </Table.Head>
                        {/each}
                    </Table.Row>
                {/each}
            </Table.Header>
            <Table.Body class="text-xs">
                {#each table.getRowModel().rows as row (row.id)}
                    <Table.Row data-state={row.getIsSelected() && "selected"}>
                        {#each row.getVisibleCells() as cell (cell.id)}
                            <Table.Cell>
                                <FlexRender
                                    content={cell.column.columnDef.cell}
                                    context={cell.getContext()}
                                />
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={columns.length} class="h-24 text-center">
                            No results.
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <div class="flex items-center justify-end gap-2 py-4">
        <Button variant="ghost"
            size="sm"
            onclick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
        >
            {"<-"}
        </Button>
        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        <Button variant="ghost"
            size="sm"
            onclick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
        >
            {"->"}
        </Button>
    </div>
</div>
