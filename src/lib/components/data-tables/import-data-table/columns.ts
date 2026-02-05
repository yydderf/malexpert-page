import { type ColumnDef } from "@tanstack/table-core";
import { AnalyzerImport } from "$lib/consts/api.ts";
import { renderSnippet, renderComponent } from "$lib/components/data-tables/parts/data-table/index.ts";
import { createRawSnippet } from "svelte";
import { shortenName, ShortenMode } from "$lib/common/string.js";
// import DataTableActions from "./actions.svelte";
import ImportDataTableButton from "./sortable-button.svelte";

export const IMPORT_TABLE_COLUMNS: ColumnDef<AnalyzerImport>[] = [
    {
        accessorKey: "name",
        header: ({ column }) =>
            renderComponent(ImportDataTableButton, {
                label: "Name",
                onclick: column.getToggleSortingHandler(),
            }),
        cell: ({ row }) => {
            const nameCellSnippet = createRawSnippet<[{ name: string }]>(
                (getName) => {
                    const { name } = getName();
                    const formatted = shortenName(name, 20, ShortenMode.PREFIX_SUFFIX);
                    // TODO: make the display on hover cooler
                    return {
                        render: () => `<div title="${name}">${formatted}</div>`
                    };
                }
            );
            return renderSnippet(nameCellSnippet, {
                name: row.original.name,
            });
        },
    },
    {
        accessorKey: "offset",
        header: ({ column }) =>
            renderComponent(ImportDataTableButton, {
                label: "Offset",
                onclick: column.getToggleSortingHandler(),
            }),
    },
    {
        accessorKey: "islib",
        header: ({ column }) =>
            renderComponent(ImportDataTableButton, {
                label: "IsLib",
                onclick: column.getToggleSortingHandler(),
            }),
    },
    {
        accessorKey: "libname",
        header: ({ column }) =>
            renderComponent(ImportDataTableButton, {
                label: "LibName",
                onclick: column.getToggleSortingHandler(),
            }),
    },
    // {
    //     id: "actions",
    //     cell: ({row}) => {
    //         return renderComponent(DataTableActions, { name: row.original.name, libname: row.original.libname });
    //     },
    // },
];
