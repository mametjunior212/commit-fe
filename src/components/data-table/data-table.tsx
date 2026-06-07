import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
} from "@tanstack/react-table";

interface Props<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    loading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    loading,
}: Props<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="text-left p-4 font-semibold"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center p-10"
                            >
                                Loading...
                            </td>
                        </tr>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-t hover:bg-muted/50 transition"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="p-4 align-middle"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center p-10"
                            >
                                Data tidak tersedia
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}