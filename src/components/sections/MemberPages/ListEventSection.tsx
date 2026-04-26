import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Loader2,
    Search,
    ChevronLeft,
    ChevronRight,
    BadgeCheck,
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { DataTablesEnvelope, EventItem, EventsParam } from "@/components/type/Datatables";
import { fetchJson, fmtDateTimeIndo, getRemaining, isOpen } from "@/lib/utils";
import Url from "@/Uri/url";
import { toast } from "@/hooks/use-toast";
import { ErrorResponse } from "@/components/type/response";

type Props = {
    params: EventsParam;
    onParamsChange: (next: EventsParam) => void;
};

function useDebouncedValue<T>(value: T, delay = 400) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

function useNow(intervalMs = 1000) {
    const [now, setNow] = React.useState(() => Date.now());
    React.useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
}

const PAGE_SIZES = [5, 10, 20, 50, 100] as const;

export default function ListEventSection({ params, onParamsChange }: Props) {

    const queryClient = useQueryClient();

    const [searchInput, setSearchInput] = React.useState(params.search ?? "");
    const debouncedSearch = useDebouncedValue(searchInput, 500);

    React.useEffect(() => {
        if ((params.search ?? "") !== debouncedSearch) {
            onParamsChange({ ...params, page: 1, search: debouncedSearch });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["listEventMember", params],
        queryFn: () => fetchPortfolio(params),
        staleTime: 60_000,               // contoh: 1 menit supaya jarang stale  
    });

    const meta = data?.meta;
    const rows = data?.data ?? [];
    const now = useNow(1000);

    function toggleSort(column: NonNullable<Props["params"]["sortBy"]>) {
        const isSame = params.sortBy === column;
        const nextOrder: "asc" | "desc" =
            isSame ? (params.sortOrder === "asc" ? "desc" : "asc") : "asc";
        onParamsChange({ ...params, sortBy: column, sortOrder: nextOrder, page: 1 });
    }

    // ---------- REGISTER MUTATION ----------
    type RegisterVars = { event_uuid: string };
    type ListEventResponse = {
        meta: any;
        data: Array<any>; // ganti ke tipe row kamu
    };

    const registerMutation = useMutation({
        mutationKey: ["register-event"],
        mutationFn: async ({ event_uuid }: RegisterVars) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30_000);
            const token = `Bearer ${atob(localStorage.getItem("access_token") ?? "")}`;

            try {
                const resp = await fetch(Url.REGISTER_EVENT_MEMBER, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: JSON.stringify({ event_id: event_uuid }),
                    signal: controller.signal,
                });

                const isJson = resp.headers.get("content-type")?.includes("application/json");
                const payload = isJson ? await resp.json() : null;

                if (!resp.ok) {
                    // Normalisasi pesan error
                    const dataError = (payload || {}) as ErrorResponse;
                    const fieldErrors =
                        dataError && typeof dataError.data === "object" && dataError.data !== null
                            ? (dataError.data as Record<string, unknown>)
                            : {};
                    const summary = Object.entries(fieldErrors)
                        .flatMap(([field, msgs]) =>
                            Array.isArray(msgs) && msgs.length > 0 && typeof msgs[0] === "string"
                                ? `${field}: ${msgs[0]}`
                                : []
                        )
                        .join(", ");
                    const fallback =
                        (typeof dataError?.errors === "string" && dataError.errors) ||
                        (typeof dataError?.message === "string" && dataError.message) ||
                        "Input tidak valid.";
                    throw new Error(summary || fallback);
                }
                refetch();
                return payload; // jika server mengembalikan data absen_personal, pakai di onSuccess
            } finally {
                clearTimeout(timeout);
            }
        },

        // >>> Perubahan UI dilakukan HANYA di onSuccess <<<
        onSuccess: (serverPayload, { event_uuid }) => {
            // Update cache listEvent untuk row terkait agar langsung jadi "Telah Melakukan Pendaftaran"
            queryClient.setQueryData<ListEventResponse>(["listEventMember", params], (old) => {
                if (!old) return old as any;

                const nextData = old.data.map((row) => {
                    if (row.uuid !== event_uuid) return row;

                    // Jika server mengembalikan absen_personal, gunakan itu.
                    // Jika tidak, set minimal array kosong -> truthy untuk menandakan telah mendaftar.
                    const nextAbsen =
                        serverPayload?.absen_personal ??
                        (Array.isArray(row.absen_personal) && row.absen_personal.length > 0
                            ? row.absen_personal
                            : [{ registered_at: new Date().toISOString() }]);

                    return { ...row, absen_personal: nextAbsen };
                });

                return { ...old, data: nextData };
            });

            toast({
                title: "Register sukses!",
                description: "Akun Berhasil dibuat. Silakan cek email untuk verifikasi.",
            });

            // Tidak perlu refetch / invalidate
        },

        onError: (err: unknown) => {
            const isAbort = (err as Error)?.name === "AbortError";
            toast({
                title: isAbort ? "Timeout" : "Registrasi gagal",
                description: isAbort
                    ? "Permintaan melebihi batas waktu. Coba lagi."
                    : (err as Error).message || "Tidak dapat terhubung ke server.",
                variant: "destructive",
            });
        },
    });

    // Helper: cek apakah row ini sedang loading register
    const isRegistering = (uuid: string) =>
        registerMutation.isPending && registerMutation.variables?.event_uuid === uuid;


    return (
        <div className="w-full space-y-4">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex items-center gap-2 max-w-md w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari judul/layanan/tahun…"
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-500">Tampilkan</label>
                    <Select.Root
                        value={String(params.perPage ?? 10)}
                        onValueChange={(v) => onParamsChange({ ...params, perPage: Number(v), page: 1 })}
                    >
                        <Select.Trigger className="inline-flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 min-w-[96px]">
                            <Select.Value />
                        </Select.Trigger>
                        <Select.Content className="rounded-lg border bg-white shadow-lg">
                            <Select.Viewport className="p-1">
                                {PAGE_SIZES.map((size) => (
                                    <Select.Item
                                        key={size}
                                        value={String(size)}
                                        className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                        <Select.ItemText>{size}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select.Root>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <Th label="#" disabled />
                            <Th label="Judul" onClick={() => toggleSort("title")} active={params.sortBy === "title"} order={params.sortOrder} />
                            <Th label="Tipe Event" onClick={() => toggleSort("category")} active={params.sortBy === "category"} order={params.sortOrder} />
                            <Th label="Tahun Pelaksaan" onClick={() => toggleSort("year")} active={params.sortBy === "year"} order={params.sortOrder} />
                            <Th label="Mulai Event" onClick={() => toggleSort("start_date")} active={params.sortBy === "start_date"} order={params.sortOrder} />
                            <Th label="Selesai Event" onClick={() => toggleSort("end_date")} active={params.sortBy === "end_date"} order={params.sortOrder} />
                            <Th label="Aktif" onClick={() => toggleSort("active")} active={params.sortBy === "active"} order={params.sortOrder} />
                            <Th label="Akhir Registrasi" onClick={() => toggleSort("close_regist")} active={params.sortBy === "close_regist"} order={params.sortOrder} />
                            <th className="text-left px-4 py-3 text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {Array.from({ length: 9 }).map((__, j) => (
                                        <Td key={j}><div className="h-3 w-24 bg-gray-200 rounded" /></Td>
                                    ))}
                                </tr>
                            ))
                        ) : isError ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-6 text-red-600">
                                    Terjadi kesalahan saat memuat data. {(error as Error)?.message}
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">Tidak ada data.</td>
                            </tr>
                        ) : (
                            rows.map((r) => {

                                const open = isOpen(now, r.close_regist);     // boolean
                                const remain = open ? getRemaining(now, r.close_regist) : null;
                                return (
                                    <tr key={r.uuid} className="border-t border-gray-100">
                                        <Td className="text-gray-500">{r.DT_RowIndex}</Td>
                                        <Td className="font-medium">{decodeHTMLEntities(r.title)}</Td>
                                        <Td>{r.category}</Td>
                                        <Td>{r.year}</Td>
                                        <Td>{fmtDateTimeIndo(r.start_date)}</Td>
                                        <Td>{fmtDateTimeIndo(r.end_date)}</Td>
                                        <Td>
                                            {r.active === "y" ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <BadgeCheck className="h-3 w-3" /> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </Td>
                                        {/* <Td>{fmtDateTimeIndo(r.close_regist)}</Td> */}
                                        <Td>{remain ? (
                                            <span className="ml-2 text-xs text-gray-500">
                                                Tutup dalam {remain.d}h {remain.h}j {remain.m}m {remain.sec}d
                                            </span>
                                        ) : <Td>{fmtDateTimeIndo(r.close_regist)}</Td>}</Td>
                                        <Td>
                                            <div className="flex gap-2">
                                                <a href={`/event/${r.uuid}`} target="_blank" className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Detail</a>
                                                {r.absen_personal.length === 0 ? (
                                                    open && r.limitUser != r.TotalRegist ? (
                                                        <button
                                                            className="px-2 py-1 rounded bg-indigo-50 text-green-600 hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                                            onClick={() => registerMutation.mutate({ event_uuid: r.uuid })}
                                                            disabled={isRegistering(r.uuid)}
                                                        >
                                                            {isRegistering(r.uuid) ? (
                                                                <>
                                                                    <svg
                                                                        className="h-4 w-4 animate-spin text-green-600"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <circle
                                                                            className="opacity-25"
                                                                            cx="12"
                                                                            cy="12"
                                                                            r="10"
                                                                            stroke="currentColor"
                                                                            strokeWidth="4"
                                                                        />
                                                                        <path
                                                                            className="opacity-75"
                                                                            fill="currentColor"
                                                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                                        />
                                                                    </svg>
                                                                    Mendaftar…
                                                                </>
                                                            ) : (
                                                                "Register"
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-500">
                                                            Pendaftaran ditutup
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-500">
                                                        Terdaftar
                                                    </span>
                                                )}
                                                {/* <button className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100">Hapus</button> */}
                                            </div>
                                        </Td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {meta ? (
                        <>Menampilkan <b>{meta.from}-{meta.to}</b> dari <b>{meta.total}</b> data</>
                    ) : "—"}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={!meta || (params.page ?? 1) === 1}
                        onClick={() => onParamsChange({ ...params, page: 1 })}
                        className="px-3 py-2 rounded-lg border disabled:opacity-50"
                        title="First"
                    >
                        «
                    </button>
                    <button
                        disabled={!meta || (params.page ?? 1) <= 1}
                        onClick={() => onParamsChange({ ...params, page: (params.page ?? 1) - 1 })}
                        className="px-3 py-2 rounded-lg border disabled:opacity-50"
                        title="Previous"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm">
                        Halaman <b>{params.page ?? 1}</b> dari <b>{meta?.last_page ?? 1}</b>
                    </span>
                    <button
                        disabled={!meta || (params.page ?? 1) >= (meta?.last_page ?? 1)}
                        onClick={() => onParamsChange({ ...params, page: (params.page ?? 1) + 1 })}
                        className="px-3 py-2 rounded-lg border disabled:opacity-50"
                        title="Next"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        disabled={!meta || (params.page ?? 1) >= (meta?.last_page ?? 1)}
                        onClick={() => onParamsChange({ ...params, page: meta!.last_page })}
                        className="px-3 py-2 rounded-lg border disabled:opacity-50"
                        title="Last"
                    >
                        »
                    </button>
                </div>
            </div>
        </div>
    );
}

// TH DAN TD TABEL
function Th({
    label,
    onClick,
    active,
    order,
    disabled = false,
}: {
    label: string;
    onClick?: () => void;
    active?: boolean;
    order?: "asc" | "desc";
    disabled?: boolean;
}) {
    if (disabled) {
        return <th className="text-left px-4 py-3 text-gray-600">{label}</th>;
    }
    return (
        <th className="text-left px-4 py-3 text-gray-600 select-none">
            <button className="inline-flex items-center gap-1 hover:text-black">
                {label}
                {/* {!active ? (
                    <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                ) : order === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                )} */}
            </button>
        </th>
    );
}

function Td({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
    return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

// Merubah Kode Html Jadi HTMl
function decodeHTMLEntities(input: string) {
    // untuk kasus "CONNECT &amp;amp; …"
    const txt = document.createElement("textarea");
    txt.innerHTML = input;
    const once = txt.value;
    txt.innerHTML = once;
    return txt.value;
}

// Builder Datatables

// PENTING: Pilih salah satu builder di sini:
const USE_DATATABLES_QUERY = true;

// Daftar kolom yang dipakai untuk sorting di DataTables query builder
const COLUMNS = ["title", "year", "category", "start_date", "end_date", "close_regist", "active"];

// ===== A) GENERIC QUERY BUILDER (aktifkan jika backend kamu mendukung) =====
function buildQueryGeneric(params: EventsParam) {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.perPage) qs.set("per_page", String(params.perPage));
    if (params.search) qs.set("search", params.search);
    if (params.sortBy) qs.set("sort", params.sortBy);
    if (params.sortOrder) qs.set("order", params.sortOrder);
    return `?${qs.toString()}`;
}

// ===== B) DATATABLES QUERY BUILDER (pakai ini jika route backend Yajra DataTables) =====
function buildQueryDataTables(params: EventsParam, columns: string[]) {
    const qs = new URLSearchParams();

    // DataTables: start = offset (0-based), length = perPage
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 10;
    const start = (page - 1) * perPage;

    qs.set("draw", "1"); // boleh dibiarkan 1 atau kamu simpan counter di state
    qs.set("start", String(start));
    qs.set("length", String(perPage));

    if (params.search) qs.set("search[value]", params.search);

    // Sorting
    // if (params.sortBy) {
    const colIndex = Math.max(0, columns.indexOf(params.sortBy));
    qs.set("order[0][column]", String(colIndex));
    qs.set("order[0][dir]", params.sortOrder ?? "asc");
    // optional: kirim juga columns[n][data] agar backend tau nama field
    columns.forEach((c, idx) => {
        qs.set(`columns[${idx}][data]`, c);
        qs.set(`columns[${idx}][name]`, c);
        qs.set(`columns[${idx}][searchable]`, "true");
        qs.set(`columns[${idx}][orderable]`, "true");
        qs.set(`columns[${idx}][search][value]`, "");
        qs.set(`columns[${idx}][search][regex]`, "false");
    });
    // }

    return `?${qs.toString()}`;
}

// Endpoint (ganti sesuai route kamu)
async function fetchPortfolio(params: EventsParam) {
    const query = USE_DATATABLES_QUERY
        ? buildQueryDataTables(params, COLUMNS)
        : buildQueryGeneric(params);

    // Response mengikuti envelope DataTables yang kamu kirimkan
    const res = await fetchJson<DataTablesEnvelope<EventItem>>(`${Url.LIST_EVENT_MEMBER}${query}`, "POST");

    // Normalisasi ke bentuk "meta" agar komponen tabel bisa dipakai ulang
    const total = res.recordsFiltered ?? res.recordsTotal ?? res.data.length;
    const perPage = params.perPage ?? 10;
    const page = params.page ?? 1;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(total, page * perPage);

    return {
        data: res.data,
        meta: {
            current_page: page,
            from,
            last_page: lastPage,
            per_page: perPage,
            to,
            total,
        },
        envelope: res,
    };
}