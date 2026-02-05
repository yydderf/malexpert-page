import { type ColumnDef } from "@tanstack/table-core";
import { AnalyzerImport } from "$lib/consts/api.ts";
import { renderSnippet } from "$lib/components/data-tables/parts/data-table/index.ts";
import { createRawSnippet } from "svelte";
import { shortenName, ShortenMode } from "$lib/common/string.js";

export const IMPORT_TABLE_COLUMNS: ColumnDef<AnalyzerImport>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({row}) => {
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
        header: "Offset",
    },
    {
        accessorKey: "islib",
        header: "IsLib",
    },
    {
        accessorKey: "libname",
        header: "LibName",
    },
];
