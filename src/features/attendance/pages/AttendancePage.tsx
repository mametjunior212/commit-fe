import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { AttendanceColumn, AttendanceParams } from "@/components/type/Datatables";
import AttendanceControls from "../components/AttendanceControls";
import AttendancePagination from "../components/AttendancePagination";
import AttendanceTable from "../components/AttendanceTable";
import { useAttendanceList } from "../hooks/useAttendanceList";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

export default function AttendancePage() {
    const { id } = useParams<{ id: string }>();

    const [params, setParams] = useState<AttendanceParams>({ page: 1, perPage: 10 });
    const [searchInput, setSearchInput] = useState("");

    const debouncedSearch = useDebouncedValue(searchInput, 500);

    useEffect(() => {
        setParams((prev) =>
            (prev.search ?? "") === debouncedSearch
                ? prev
                : { ...prev, page: 1, search: debouncedSearch }
        );
    }, [debouncedSearch]);

    const { data, isLoading, isFetching, isError, error, refetch } = useAttendanceList(id, params);

    const rows = data?.rows ?? [];
    const meta = data?.meta;
    const eventTitle = rows[0]?.title || "Daftar Kehadiran";

    function toggleSort(column: AttendanceColumn) {
        const isSame = params.sortBy === column;
        const nextOrder: "asc" | "desc" = isSame && params.sortOrder === "asc" ? "desc" : "asc";
        setParams((prev) => ({ ...prev, sortBy: column, sortOrder: nextOrder, page: 1 }));
    }

    function goToPage(page: number) {
        setParams((prev) => ({ ...prev, page }));
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Helmet>
                <title>{eventTitle}</title>
            </Helmet>

            <Navigation />

            <main className="flex-1 pt-24 md:pt-28 px-4 pb-16">
                <div className="w-full max-w-6xl mx-auto space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-foreground/50">Attendance</p>
                        <h1 className="text-xl md:text-2xl font-semibold mt-1">{eventTitle}</h1>
                    </div>

                    <AttendanceControls
                        searchInput={searchInput}
                        onSearchChange={setSearchInput}
                        isFetching={isFetching}
                        onRefresh={refetch}
                        perPage={params.perPage ?? 10}
                        onPerPageChange={(perPage) => setParams((prev) => ({ ...prev, perPage, page: 1 }))}
                    />

                    <AttendanceTable
                        rows={rows}
                        isLoading={isLoading}
                        isError={isError}
                        errorMessage={(error as Error | undefined)?.message}
                        sortBy={params.sortBy as AttendanceColumn | undefined}
                        sortOrder={params.sortOrder}
                        onToggleSort={toggleSort}
                    />

                    <AttendancePagination meta={meta} page={params.page ?? 1} onPageChange={goToPage} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
