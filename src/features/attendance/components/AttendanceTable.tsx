import { AttendanceColumn, AttendanceItem } from "@/components/type/Datatables";
import { COLUMN_CONFIG } from "../constants/attendance.constant";
import { resolveCellValue } from "../utils/attendance.util";
import { Td, Th, renderAttendanceCell } from "./AttendanceTableCells";

type AttendanceTableProps = {
    rows: AttendanceItem[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    sortBy?: AttendanceColumn;
    sortOrder?: "asc" | "desc";
    onToggleSort: (column: AttendanceColumn) => void;
};

export default function AttendanceTable({
    rows,
    isLoading,
    isError,
    errorMessage,
    sortBy,
    sortOrder,
    onToggleSort,
}: AttendanceTableProps) {
    const colSpan = COLUMN_CONFIG.length + 1;

    return (
        <div className="rounded-xl border border-gray-200 dark:border-[hsl(var(--input))] overflow-hidden">
            <div className="w-full overflow-x-auto">
                <table className="min-w-[2400px] w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-[hsl(var(--secondary))]">
                        <tr>
                            <Th label="#" />
                            {COLUMN_CONFIG.map(({ key, label }) => (
                                <Th
                                    key={key}
                                    label={label}
                                    column={key}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={onToggleSort}
                                />
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        <AttendanceTableBody
                            rows={rows}
                            isLoading={isLoading}
                            isError={isError}
                            errorMessage={errorMessage}
                            colSpan={colSpan}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

type AttendanceTableBodyProps = {
    rows: AttendanceItem[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    colSpan: number;
};

function AttendanceTableBody({
    rows,
    isLoading,
    isError,
    errorMessage,
    colSpan,
}: AttendanceTableBodyProps) {
    if (isLoading) {
        return (
            <>
                {[...Array(5)].map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                        {Array.from({ length: colSpan }).map((__, j) => (
                            <Td key={j}>
                                <div className="h-3 w-full max-w-[120px] bg-gray-200 dark:bg-gray-700 rounded" />
                            </Td>
                        ))}
                    </tr>
                ))}
            </>
        );
    }

    if (isError) {
        return (
            <tr>
                <td colSpan={colSpan} className="px-4 py-6 text-red-600">
                    Terjadi kesalahan. {errorMessage}
                </td>
            </tr>
        );
    }

    if (rows.length === 0) {
        return (
            <tr>
                <td colSpan={colSpan} className="px-4 py-6 text-center text-gray-500">
                    Tidak ada data
                </td>
            </tr>
        );
    }

    return (
        <>
            {rows.map((row, index) => (
                <AttendanceRow key={row.uuid ?? index} row={row} index={index + 1} />
            ))}
        </>
    );
}

function AttendanceRow({ row, index }: { row: AttendanceItem; index: number }) {
    return (
        <tr className="border-t border-gray-100 dark:border-gray-700">
            <Td>{row.DT_RowIndex ?? index}</Td>
            {COLUMN_CONFIG.map(({ key }) => (
                <Td key={key} className={key === "nama" ? "font-medium" : ""}>
                    {renderAttendanceCell(key, resolveCellValue(row, key))}
                </Td>
            ))}
        </tr>
    );
}
