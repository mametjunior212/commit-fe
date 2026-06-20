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
    type VotingOption = {
        uuid: string;
        name: string;
        path: string;
        filename: string;
        created_at: string | null;
        updated_at: string | null;
        created_by: string | null;
        updated_by: string | null;
    };

    type EventRow = EventItem & {
        voting_option: VotingOption[];
    };

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
            queryClient.setQueryData<ListEventResponse>(["listVotingMember", params], (old) => {
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
            // queryClient.invalidateQueries({ queryKey: ["listVotingMember"] });
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
    const [previewZoom, setPreviewZoom] = React.useState(1);

    function openPreview(src: string, alt?: string) {
        setPreviewSrc(src);
        setPreviewAlt(alt ?? "");
        setPreviewOpen(true);
        setPreviewZoom(1);
    }
    function closePreview() {
        setPreviewOpen(false);
        setPreviewSrc(null);
        setPreviewAlt(null);
        setPreviewZoom(1);
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

            {/* ================= VOTING MODAL ================= */}
            <Dialog.Root open={voteModal.open} onOpenChange={(open) => {
                if (!open) closeVoteModal();
            }}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <Dialog.Content className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-white dark:bg-[hsl(var(--background))] border-b border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                                            Pilih Opsi Voting
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {voteModal.event?.title}
                                        </p>
                                    </div>
                                    <Dialog.Close className="absolute right-4 top-4 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    </Dialog.Close>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Voting Info */}
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                        <span className="font-semibold">Waktu Voting:</span> {voteModal.event?.open_regist} sampai {voteModal.event?.end_date}
                                    </p>
                                </div>

                                {/* Options Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {voteModal.event?.voting_option && voteModal.event.voting_option.length > 0 ? (
                                        voteModal.event.voting_option.map((option) => {
                                            const isSelected = selectedOption === option.uuid;
                                            const imageUrl = (import.meta as ImportMeta).env.VITE_FONT_END + option.path;

                                            return (
                                                <div
                                                    key={option.uuid}
                                                    onClick={() => setSelectedOption(option.uuid)}
                                                    className={`cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden ${isSelected
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                        }`}
                                                >
                                                    {/* Image Container */}
                                                    <div className="relative h-40 bg-gray-100 dark:bg-gray-800 overflow-hidden group">
                                                        <img
                                                            src={imageUrl}
                                                            alt={option.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="160" viewBox="0 0 400 160"%3E%3Crect fill="%23e5e7eb" width="400" height="160"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="14" fill="%236b7280"%3EImage not found%3C/text%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                        {/* Preview Button */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openPreview(imageUrl, option.name);
                                                            }}
                                                            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        >
                                                            <div className="text-white text-center">
                                                                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 13H7" />
                                                                </svg>
                                                                <span className="text-xs font-semibold">Zoom</span>
                                                            </div>
                                                        </button>

                                                        {/* Selection Indicator */}
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                                                                <Check className="h-4 w-4 text-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Option Info */}
                                                    <div className="p-4">
                                                        <h4 className={`font-bold text-center transition-colors ${isSelected
                                                            ? 'text-indigo-600 dark:text-indigo-400'
                                                            : 'text-gray-900 dark:text-white'
                                                            }`}>
                                                            {option.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                                            Tidak ada opsi voting tersedia
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white dark:bg-[hsl(var(--background))] border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
                                <button
                                    onClick={closeVoteModal}
                                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        if (voteModal.event && selectedOption) {
                                            voteMutation.mutate({
                                                event_uuid: voteModal.event.uuid,
                                                option_uuid: selectedOption,
                                            });
                                        }
                                    }}
                                    disabled={!selectedOption || isSavingVote}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${!selectedOption || isSavingVote
                                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white'
                                        }`}
                                >
                                    {isSavingVote && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isSavingVote ? 'Menyimpan...' : 'Konfirmasi Vote'}
                                </button>
                            </div>
                        </Dialog.Content>
                    </div>
                </Dialog.Portal>
            </Dialog.Root>

            {/* ================= IMAGE PREVIEW MODAL ================= */}
            <Dialog.Root open={previewOpen} onOpenChange={(open) => {
                if (!open) closePreview();
            }}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80" />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <Dialog.Content
                            className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-gray-900 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 flex flex-col overflow-hidden">
                            <Dialog.Title className="sr-only">
                                Preview Image
                            </Dialog.Title>
                            {/* Close Button */}
                            <Dialog.Close className="absolute right-4 top-4 z-10 rounded-lg p-2 hover:bg-gray-700 transition-colors">
                                <X className="h-6 w-6 text-white" />
                            </Dialog.Close>

                            {/* Image Container */}
                            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <img
                                        src={previewSrc ?? ""}
                                        alt={previewAlt ?? ""}
                                        style={{
                                            transform: `scale(${previewZoom})`,
                                            transition: 'transform 0.2s ease-in-out',
                                            maxHeight: 'calc(90vh - 150px)',
                                            maxWidth: '100%',
                                            objectFit: 'contain',
                                        }}
                                        className="rounded-lg"
                                    />

                                    {/* Zoom Controls */}
                                    <div className="flex items-center gap-4 z-50 bg-gray-800 px-6 py-3 rounded-lg">
                                        <button
                                            onClick={() => setPreviewZoom(Math.max(1, previewZoom - 0.2))}
                                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                                            title="Zoom Out"
                                        >
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>

                                        <span className="text-white font-semibold min-w-[60px] text-center">
                                            {Math.round(previewZoom * 100)}%
                                        </span>

                                        <button
                                            onClick={() => setPreviewZoom(Math.min(3, previewZoom + 0.2))}
                                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                                            title="Zoom In"
                                        >
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>

                                        <div className="w-px h-6 bg-gray-600" />

                                        <button
                                            onClick={() => setPreviewZoom(1)}
                                            className="px-4 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors font-medium"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Image Info */}
                            <div className="bg-gray-800 px-6 py-3 text-center text-gray-300 text-sm">
                                {previewAlt}
                            </div>
                        </Dialog.Content>
                    </div>
                </Dialog.Portal>
            </Dialog.Root>

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


