import { ChevronLeft, ChevronRight } from "lucide-react";
import { AttendanceMeta } from "../types/attendance.type";

type AttendancePaginationProps = {
    meta?: AttendanceMeta;
    page: number;
    onPageChange: (page: number) => void;
};

export default function AttendancePagination({
    meta,
    page,
    onPageChange,
}: AttendancePaginationProps) {
    const lastPage = meta?.lastPage ?? 1;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                {meta ? (
                    <>
                        Menampilkan <b>{meta.from}-{meta.to}</b> dari <b>{meta.total}</b>
                    </>
                ) : (
                    "-"
                )}
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
                <button type="button" onClick={() => onPageChange(1)} className="px-3 py-2 border rounded-lg">
                    «
                </button>

                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    className="px-3 py-2 border rounded-lg"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-sm">
                    {page} / {lastPage}
                </span>

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(lastPage, page + 1))}
                    className="px-3 py-2 border rounded-lg"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>

                <button type="button" onClick={() => onPageChange(lastPage)} className="px-3 py-2 border rounded-lg">
                    »
                </button>
            </div>
        </div>
    );
}
