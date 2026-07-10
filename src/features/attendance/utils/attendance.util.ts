import { AttendanceColumn, AttendanceItem } from "@/components/type/Datatables";
import { FALLBACK_SOURCE } from "../constants/attendance.constant";
import { AttendanceCellValue } from "../types/attendance.type";

export function resolveCellValue(
    row: AttendanceItem,
    key: AttendanceColumn
): AttendanceCellValue {
    const primary = row[key];

    if (primary !== null && primary !== undefined && primary !== "") {
        return primary;
    }

    const fallbackKey = FALLBACK_SOURCE[key];

    if (!fallbackKey) return primary;

    return row[fallbackKey] ?? primary;
}
