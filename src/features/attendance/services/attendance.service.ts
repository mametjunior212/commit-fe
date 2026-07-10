import {
    AttendanceItem,
    AttendanceParams,
    DataTablesEnvelope,
} from "@/components/type/Datatables";
import { COLUMNS, QUERY_COLUMNS, SEARCHABLE_FIELDS } from "../constants/attendance.constant";
import { AttendancePageData } from "../types/attendance.type";

export function buildAttendanceQuery(params: AttendanceParams) {
    const qs = new URLSearchParams();
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 10;
    const start = (page - 1) * perPage;

    qs.set("draw", "1");
    qs.set("start", String(start));
    qs.set("length", String(perPage));

    if (params.search) qs.set("search[value]", params.search);
    qs.set("search[regex]", "false");

    const sortColumn = params.sortBy || COLUMNS[0];
    const sortIndex = Math.max(0, QUERY_COLUMNS.indexOf(sortColumn));
    qs.set("order[0][column]", String(sortIndex));
    qs.set("order[0][dir]", params.sortOrder ?? "asc");

    QUERY_COLUMNS.forEach((column, idx) => {
        qs.set(`columns[${idx}][data]`, column);
        qs.set(`columns[${idx}][name]`, column);
        qs.set(`columns[${idx}][searchable]`, String(SEARCHABLE_FIELDS.has(column)));
        qs.set(`columns[${idx}][orderable]`, "true");
        qs.set(`columns[${idx}][search][value]`, "");
        qs.set(`columns[${idx}][search][regex]`, "false");
    });

    return `?${qs.toString()}`;
}

export async function fetchAttendanceList(
    endpoint: string,
    params: AttendanceParams,
    signal?: AbortSignal
): Promise<AttendancePageData> {
    const query = buildAttendanceQuery(params);
    const res = await fetch(`${endpoint}${query}`, { method: "POST", signal });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    const json: DataTablesEnvelope<AttendanceItem> = await res.json();

    const page = params.page ?? 1;
    const perPage = params.perPage ?? 10;
    const total = json.recordsFiltered ?? json.recordsTotal ?? json.data.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(total, page * perPage);

    return {
        rows: json.data,
        meta: { page, perPage, total, lastPage, from, to },
    };
}
