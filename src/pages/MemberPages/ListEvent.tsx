import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { EventsParam } from "@/components/type/Datatables";
import ListEventSection from "@/components/sections/MemberPages/ListEventSection";

const readNumber = (v: string | null, d: number) => (v ? Number(v) : d);

export default function ListEvent() {

    const sp = useSearchParams()[0]; // cuma untuk baca awal
    const [params, setParams] = React.useState<EventsParam>(() => ({
        page: readNumber(sp.get("page"), 1),
        perPage: readNumber(sp.get("per_page"), 10),
        search: sp.get("search") ?? "",
        sortBy: (sp.get("sort") as EventsParam["sortBy"]) || undefined,
        sortOrder: (sp.get("order") as "asc" | "desc") || undefined,
    }));

    // Penting: TIDAK ada setSp di sini
    function onParamsChange(next: EventsParam) {
        setParams(prev => ({ ...prev, ...next }));
    }


    return (
        <HelmetProvider>
            <div className="p-6 max-w-7xl mx-auto">
                <Helmet>
                    <title>List Event</title>
                </Helmet>

                <h1 className="text-2xl font-semibold mb-2">List Event</h1>

                <ListEventSection params={params} onParamsChange={onParamsChange} />
            </div>
        </HelmetProvider>
    );
}