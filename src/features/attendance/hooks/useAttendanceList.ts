import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AttendanceParams } from "@/components/type/Datatables";
import Url from "@/Uri/url";
import { fetchAttendanceList } from "../services/attendance.service";
import { AttendancePageData } from "../types/attendance.type";

export function useAttendanceList(id: string | undefined, params: AttendanceParams) {
    const endpoint = useMemo(() => `${Url.ATTENDANCE_API}${id ?? ""}`, [id]);

    return useQuery<AttendancePageData>({
        queryKey: ["attendanceList", endpoint, params],
        queryFn: ({ signal }) => fetchAttendanceList(endpoint, params, signal),
        enabled: Boolean(id),
        staleTime: 30_000,
    });
}
