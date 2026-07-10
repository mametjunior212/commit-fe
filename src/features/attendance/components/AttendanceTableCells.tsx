import * as React from "react";
import { AttendanceColumn } from "@/components/type/Datatables";
import { fmtDateTimeIndo } from "@/lib/utils";
import { FLAG_COLUMNS } from "../constants/attendance.constant";
import { AttendanceCellValue } from "../types/attendance.type";

export function StatusBadge({ value }: { value: AttendanceCellValue }) {
    return value === "y" ? (
        <span className="badge-green">Ya</span>
    ) : (
        <span className="badge-gray">Tidak</span>
    );
}

export function renderAttendanceCell(key: AttendanceColumn, value: AttendanceCellValue) {
    if (FLAG_COLUMNS.includes(key)) {
        return <StatusBadge value={value} />;
    }

    if (key === "created_at") {
        return fmtDateTimeIndo(value as string | null);
    }

    return value ?? "-";
}

type ThProps = {
    label: string;
    column?: AttendanceColumn;
    sortBy?: AttendanceColumn;
    sortOrder?: "asc" | "desc";
    onSort?: (column: AttendanceColumn) => void;
};

export function Th({ label, column, sortBy, sortOrder, onSort }: ThProps) {
    if (!column) {
        return <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300">{label}</th>;
    }

    const isActive = sortBy === column;
    const indicator = isActive ? (sortOrder === "asc" ? "▲" : "▼") : "";

    return (
        <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 select-none">
            <button
                type="button"
                onClick={() => onSort?.(column)}
                className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white"
            >
                {label}
                {indicator && <span className="text-xs">{indicator}</span>}
            </button>
        </th>
    );
}

export function Td({
    children,
    className = "",
}: React.PropsWithChildren<{ className?: string }>) {
    return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
