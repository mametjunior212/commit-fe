import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Loader2,
    Search,
    ChevronLeft,
    ChevronRight,
    BadgeCheck,
    Check,
    X,
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import * as Dialog from "@radix-ui/react-dialog";

import { EventItem, EventsParam } from "@/components/type/Datatables";
import { decodeHtmlEntities, fetchPortfolio, fmtDateTimeIndo, getRemaining } from "@/lib/utils";
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
// ===== Query Builder =====
const USE_DATATABLES_QUERY = true;
// Pakai open_regist (bukan close_regist)
const COLUMNS = ["title", "year", "category", "start_date", "end_date", "open_regist", "active"];

export default function ListVotingSection({ params, onParamsChange }: Props) {
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
        queryKey: ["listVotingMember", params],
        queryFn: () => fetchPortfolio(params, COLUMNS, USE_DATATABLES_QUERY, Url.LIST_VOTE_MEMBER, "POST"),
        staleTime: 60_000,
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

    // ------------------------
    // Voting Modal State
    // ------------------------
    type EventRow = EventItem;

    type VoteModalState = {
        open: boolean;
        event?: EventRow;
    };

    const [voteModal, setVoteModal] = React.useState<VoteModalState>({ open: false });
    const [selectedOption, setSelectedOption] = React.useState<string>("");

    const openVoteModal = (ev: EventRow) => {
        setVoteModal({ open: true, event: ev });
        setSelectedOption("");
    };
    const closeVoteModal = () => {
        setVoteModal({ open: false, event: undefined });
        setSelectedOption("");
    };

    // ------------------------
    // VOTE MUTATION
    // ------------------------
    type VoteVars = { event_uuid: string; option_uuid: string };
    type ListEventResponse = {
        meta: any;
        data: Array<any>;
    };

    const voteMutation = useMutation({
        mutationKey: ["vote-event"],
        mutationFn: async ({ event_uuid, option_uuid }: VoteVars) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30_000);
            const token = `Bearer ${atob(localStorage.getItem("access_token") ?? "")}`;
            try {
                // Ganti URL & payload sesuai API kamu
                const resp = await fetch(Url.VOTE_EVENT_MEMBER, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: JSON.stringify({
                        event_id: event_uuid,
                        option_id: option_uuid,
                    }),
                    signal: controller.signal,
                });

                const isJson = resp.headers.get("content-type")?.includes("application/json");
                const payload = isJson ? await resp.json() : null;

                if (!resp.ok) {
                    const dataError = (payload ?? {}) as ErrorResponse<{}>;
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
                        (typeof dataError?.errors === "string" && dataError.errors) ??
                        (typeof dataError?.message === "string" && dataError.message) ??
                        "Input tidak valid.";
                    throw new Error(summary || fallback);
                }

                return payload;
            } finally {
                clearTimeout(timeout);
            }
        },
        onSuccess: (_payload, { event_uuid }) => {
            // Update cache supaya tombol di list berubah jadi "Voted" tanpa refetch
            queryClient.setQueryData<ListEventResponse>(["listEventMember", params], (old) => {
                if (!old) return old as any;
                const nextData = old.data.map((row) => {
                    if (row.uuid !== event_uuid) return row;
                    return { ...row, voting_personal: ["true"] };
                });
                return { ...old, data: nextData };
            });

            toast({
                title: "Voting tersimpan",
                description: "Pilihan kamu sudah direkam. Terima kasih!",
            });

            closeVoteModal();
            // Jika ingin memastikan sinkron dengan server, boleh aktifkan ini:
            // queryClient.invalidateQueries({ queryKey: ["listEventMember"] });
        },
        onError: (err: unknown) => {
            const isAbort = (err as Error)?.name === "AbortError";
            toast({
                title: isAbort ? "Timeout" : "Gagal menyimpan voting",
                description: isAbort
                    ? "Permintaan melebihi batas waktu. Coba lagi."
                    : (err as Error).message ?? "Tidak dapat terhubung ke server.",
                variant: "destructive",
            });
        },
    });

    const isSavingVote = voteMutation.isPending;

    // === Image preview state ===
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
    const [previewAlt, setPreviewAlt] = React.useState<string | null>(null);

    function openPreview(src: string, alt?: string) {
        setPreviewSrc(src);
        setPreviewAlt(alt ?? "");
        setPreviewOpen(true);
    }
    function closePreview() {
        setPreviewOpen(false);
        setPreviewSrc(null);
        setPreviewAlt(null);
    }

    return (
        <div className="w-full space-y-4">

            {/* ================= CONTROLS ================= */}
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">

                {/* SEARCH */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari judul / layanan / tahun..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border
          bg-white text-black border-gray-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          dark:bg-[hsl(var(--background))]
          dark:text-white
          dark:border-[hsl(var(--input))]"
                        />
                    </div>

                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm
        bg-gray-100 hover:bg-gray-200
        dark:bg-[hsl(var(--secondary))]
        dark:hover:bg-[hsl(var(--accent))]"
                    >
                        {isFetching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : "Refresh"}
                    </button>
                </div>

                {/* PAGE SIZE */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
                    <label className="text-sm text-gray-500 dark:text-gray-400">
                        Tampilkan
                    </label>

                    <Select.Root
                        value={String(params.perPage ?? 10)}
                        onValueChange={(v) =>
                            onParamsChange({ ...params, perPage: Number(v), page: 1 })
                        }
                    >
                        <Select.Trigger
                            className="rounded-lg border px-3 py-2 min-w-[90px]
          bg-white dark:bg-[hsl(var(--background))]
          border-gray-200 dark:border-[hsl(var(--input))]"
                        >
                            <Select.Value />
                        </Select.Trigger>

                        <Select.Content className="rounded-lg border bg-white dark:bg-[hsl(var(--background))] shadow-lg">
                            <Select.Viewport className="p-1">
                                {PAGE_SIZES.map((size) => (
                                    <Select.Item
                                        key={size}
                                        value={String(size)}
                                        className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[hsl(var(--accent))] cursor-pointer"
                                    >
                                        <Select.ItemText>{size}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select.Root>
                </div>
            </div>


            {/* ================= TABLE ================= */}
            <div className="rounded-xl border border-gray-200 dark:border-[hsl(var(--input))] overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="min-w-[1000px] w-full text-sm">

                        <thead className="bg-gray-50 dark:bg-[hsl(var(--secondary))]">
                            <tr>
                                <Th label="#" disabled />
                                <Th label="Judul" onClick={() => toggleSort("title")} active={params.sortBy === "title"} order={params.sortOrder} />
                                <Th label="Tipe Event" onClick={() => toggleSort("category")} active={params.sortBy === "category"} order={params.sortOrder} />
                                <Th label="Tahun" onClick={() => toggleSort("year")} active={params.sortBy === "year"} order={params.sortOrder} />
                                <Th label="Mulai" onClick={() => toggleSort("start_date")} active={params.sortBy === "start_date"} order={params.sortOrder} />
                                <Th label="Selesai" onClick={() => toggleSort("end_date")} active={params.sortBy === "end_date"} order={params.sortOrder} />
                                <Th label="Status" onClick={() => toggleSort("active")} active={params.sortBy === "active"} order={params.sortOrder} />
                                <Th label="Voting Window" />
                                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 9 }).map((__, j) => (
                                            <Td key={j}>
                                                <div className="h-3 w-full max-w-[120px] bg-gray-200 dark:bg-gray-700 rounded" />
                                            </Td>
                                        ))}
                                    </tr>
                                ))
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                                        Tidak ada data
                                    </td>
                                </tr>
                            ) : (
                                rows.map((r) => {
                                    const startMs = new Date(r.open_regist).getTime();
                                    const endMs = new Date(r.end_date).getTime();
                                    const isVotingOpen = now >= startMs && now <= endMs;
                                    const remain = isVotingOpen ? getRemaining(now, r.end_date) : null;

                                    return (
                                        <tr key={r.uuid} className="border-t border-gray-100 dark:border-gray-700">
                                            <Td>{r.DT_RowIndex}</Td>
                                            <Td className="font-medium">{decodeHTMLEntities(r.title)}</Td>
                                            <Td>{r.category}</Td>
                                            <Td>{r.year}</Td>
                                            <Td>{fmtDateTimeIndo(r.start_date)}</Td>
                                            <Td>{fmtDateTimeIndo(r.end_date)}</Td>

                                            {/* STATUS */}
                                            <Td>
                                                {r.active === "y" ? (
                                                    <span className="badge-green">Aktif</span>
                                                ) : (
                                                    <span className="badge-gray">Nonaktif</span>
                                                )}
                                            </Td>

                                            {/* VOTING WINDOW */}
                                            <Td>
                                                {remain ? (
                                                    <span className="text-xs text-gray-500">
                                                        Tutup {remain.d}h {remain.h}j {remain.m}m
                                                    </span>
                                                ) : (
                                                    <div className="text-xs text-gray-500">
                                                        <div>Mulai: {fmtDateTimeIndo(r.open_regist)}</div>
                                                        <div>Selesai: {fmtDateTimeIndo(r.end_date)}</div>
                                                    </div>
                                                )}
                                            </Td>

                                            {/* ACTION */}
                                            <Td>
                                                <div className="flex flex-wrap gap-2">
                                                    <a
                                                        href={`/event/${r.uuid}`}
                                                        target="_blank"
                                                        className="btn-indigo"
                                                    >
                                                        Detail
                                                    </a>

                                                    {r.voting_personal.length !== 0 ? (
                                                        <span className="badge-green">Voted</span>
                                                    ) : r.absen_personal?.length > 0 ? (
                                                        <span className="badge-gray">Terdaftar</span>
                                                    ) : isVotingOpen ? (
                                                        <button
                                                            onClick={() => openVoteModal(r)}
                                                            className="btn-green"
                                                        >
                                                            Vote
                                                        </button>
                                                    ) : (
                                                        <span className="badge-gray">Closed</span>
                                                    )}
                                                </div>
                                            </Td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* ================= PAGINATION ================= */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {meta ? (
                        <>Menampilkan <b>{meta.from}-{meta.to}</b> dari <b>{meta.total}</b></>
                    ) : "-"}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => onParamsChange({ ...params, page: 1 })} className="pagination-btn">«</button>
                    <button onClick={() => onParamsChange({ ...params, page: (params.page ?? 1) - 1 })} className="pagination-btn">
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="text-sm">
                        {params.page ?? 1} / {meta?.last_page ?? 1}
                    </span>

                    <button onClick={() => onParamsChange({ ...params, page: (params.page ?? 1) + 1 })} className="pagination-btn">
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    <button onClick={() => onParamsChange({ ...params, page: meta?.last_page })} className="pagination-btn">»</button>
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
            <button className="inline-flex items-center gap-1 hover:text-black" onClick={onClick}>
                {label}
                {/* Ikon sort bisa diaktifkan sesuai kebutuhan */}
            </button>
        </th>
    );
}
function Td({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
    return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

// Merubah Kode Html Jadi HTMl
function decodeHTMLEntities(input: string) {
    const txt = document.createElement("textarea");
    txt.innerHTML = input;
    const once = txt.value;
    txt.innerHTML = once;
    return txt.value;
}


