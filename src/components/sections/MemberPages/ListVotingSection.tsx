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
                    const dataError = (payload ?? {}) as ErrorResponse;
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
                            <Th
                                label="Judul"
                                onClick={() => toggleSort("title")}
                                active={params.sortBy === "title"}
                                order={params.sortOrder}
                            />
                            <Th
                                label="Tipe Event"
                                onClick={() => toggleSort("category")}
                                active={params.sortBy === "category"}
                                order={params.sortOrder}
                            />
                            <Th
                                label="Tahun Pelaksaan"
                                onClick={() => toggleSort("year")}
                                active={params.sortBy === "year"}
                                order={params.sortOrder}
                            />
                            <Th
                                label="Mulai Event"
                                onClick={() => toggleSort("start_date")}
                                active={params.sortBy === "start_date"}
                                order={params.sortOrder}
                            />
                            <Th
                                label="Selesai Event"
                                onClick={() => toggleSort("end_date")}
                                active={params.sortBy === "end_date"}
                                order={params.sortOrder}
                            />
                            <Th
                                label="Aktif"
                                onClick={() => toggleSort("active")}
                                active={params.sortBy === "active"}
                                order={params.sortOrder}
                            />
                            {/* Kolom info Window Voting (opsional untuk sort). Jika ingin sort, aktifkan toggleSort("open_regist") */}
                            <Th label="Window Voting" />
                            <th className="text-left px-4 py-3 text-gray-600">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {Array.from({ length: 9 }).map((__, j) => (
                                        <Td key={j}>
                                            <div className="h-3 w-24 bg-gray-200 rounded" />
                                        </Td>
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
                                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                                    Tidak ada data.
                                </td>
                            </tr>
                        ) : (
                            rows.map((raw) => {
                                const r = raw as EventRow;

                                // ==== WINDOW VOTING: open_regist .. end_date ====
                                const startMs = r.open_regist ? new Date(r.open_regist).getTime() : NaN;
                                const endMs = r.end_date ? new Date(r.end_date).getTime() : NaN;
                                const isVotingOpen =
                                    Number.isFinite(startMs) &&
                                    Number.isFinite(endMs) &&
                                    now >= startMs &&
                                    now <= endMs;

                                // Countdown ke end_date saat window sedang terbuka
                                const remain = isVotingOpen ? getRemaining(now, r.end_date) : null;

                                const options: { uuid: string; name: string; path: string; filename: string; }[] = Array.isArray(r.voting_option) ? r.voting_option : [];

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

                                        {/* Window Voting (info) */}
                                        <Td>
                                            {remain ? (
                                                <span className="ml-2 text-xs text-gray-500">
                                                    Voting ditutup dalam {remain.d}h {remain.h}j {remain.m}m {remain.sec}d
                                                </span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-600">
                                                        Mulai: {fmtDateTimeIndo(r.open_regist as any)}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Selesai: {fmtDateTimeIndo(r.end_date)}
                                                    </span>
                                                </div>
                                            )}
                                        </Td>

                                        {/* Aksi */}
                                        <Td>
                                            <div className="flex gap-2">
                                                <a
                                                    href={`/event/${r.uuid}`}
                                                    target="_blank"
                                                    className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                >
                                                    Detail
                                                </a>

                                                {r.voting_personal.length !== 0 ? (
                                                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
                                                        Voted
                                                    </span>
                                                ) : r.absen_personal?.length > 0 ? (
                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-500">Terdaftar</span>
                                                ) : isVotingOpen ? (
                                                    <button
                                                        className="px-2 py-1 rounded bg-indigo-50 text-green-600 hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                                        onClick={() => openVoteModal(r)}
                                                        disabled={options.length === 0}
                                                        title={options.length === 0 ? "Belum ada pilihan voting" : "Daftar & Vote"}
                                                    >
                                                        Vote
                                                    </button>
                                                ) : (
                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-500">
                                                        Voting belum dibuka / sudah ditutup
                                                    </span>
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

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {meta ? (
                        <>Menampilkan <b>{meta.from}-{meta.to}</b> dari <b>{meta.total}</b> data</>
                    ) : (
                        "—"
                    )}
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

            {/* ---------- MODAL VOTING ---------- */}
            <Dialog.Root
                open={voteModal.open}
                onOpenChange={(o) => (o ? setVoteModal((s) => ({ ...s, open: true })) : closeVoteModal())}
            >
                <Dialog.Portal>
                    {/* Overlay tetap ada, tetapi klik di luar TIDAK menutup modal */}
                    <Dialog.Overlay className="fixed z-50 inset-0 bg-black/40 backdrop-blur-[1px]" />
                    <Dialog.Content
                        className="fixed left-1/2 z-[60] top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl outline-none"
                        onInteractOutside={(e) => e.preventDefault()}         // <<< cegah close via klik di background
                    // onEscapeKeyDown={(e) => e.preventDefault()}        // <<< uncomment jika ingin cegah tombol Esc
                    >
                        <div className="flex items-start justify-between">
                            <Dialog.Title className="text-lg font-semibold">Pilih Voting</Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 rounded hover:bg-gray-100" disabled={isSavingVote}>
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                            Event: <span className="font-medium">{voteModal.event?.title}</span>
                        </p>

                        <div className="mt-4 space-y-2 max-h-[50vh] overflow-auto pr-1">
                            {Array.isArray(voteModal.event?.voting_option) &&
                                (voteModal.event?.voting_option?.length ?? 0) > 0 ? (
                                voteModal.event!.voting_option!.map((opt) => (
                                    <label
                                        key={opt.uuid}
                                        className={`flex items-center gap-4 rounded-lg border p-3 cursor-pointer transition-colors
                                        ${selectedOption === opt.uuid ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        {/* ==== FOTO (dua opsi klik) ==== */}
                                        <div className="relative">
                                            {/* Opsi A: klik gambar -> buka tab baru */}
                                            <a
                                                href={decodeHtmlEntities(opt.path)}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Buka gambar di tab baru"
                                                onClick={(e) => e.stopPropagation()} // jangan trigger pilih radio saat klik gambar
                                            >
                                                <img
                                                    src={decodeHtmlEntities(opt.path)}
                                                    alt={decodeHtmlEntities(opt.name)}
                                                    className="w-16 h-16 object-cover rounded-md border"
                                                    loading="lazy"
                                                />
                                            </a>

                                            {/* Opsi B: tombol kecil (ikon) untuk popup preview */}
                                            <button
                                                type="button"
                                                className="absolute -bottom-2 -right-2 px-2 py-1 text-xs rounded bg-black/70 text-white hover:bg-black"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openPreview(decodeHtmlEntities(opt.path), opt.name);
                                                }}
                                                title="Lihat pratinjau"
                                            >
                                                Preview
                                            </button>
                                        </div>

                                        {/* RADIO & TITLE */}
                                        <div className="flex-1">
                                            <div className="font-medium">{opt.name}</div>
                                            {/* Jika ingin tampilkan filename: */}
                                            {/* <div className="text-xs text-gray-500">{opt.filename}</div> */}
                                        </div>

                                        <input
                                            type="radio"
                                            name="votingOption"
                                            className="h-4 w-4 text-indigo-600"
                                            checked={selectedOption === opt.uuid}
                                            onChange={() => setSelectedOption(opt.uuid)}
                                            disabled={isSavingVote}
                                        />

                                        {selectedOption === opt.uuid ? (
                                            <Check className="h-4 w-4 text-indigo-600" />
                                        ) : null}
                                    </label>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500">Belum ada pilihan voting untuk event ini.</div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2">
                            <Dialog.Close asChild disabled={isSavingVote}>
                                <button className="px-3 py-2 rounded-lg border">Batal</button>
                            </Dialog.Close>
                            <button
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={() => {
                                    if (!voteModal.event || !selectedOption) return;
                                    voteMutation.mutate({
                                        event_uuid: voteModal.event.uuid,
                                        option_uuid: selectedOption,
                                    });
                                }}
                                disabled={!selectedOption || isSavingVote || !voteModal.event}
                            >
                                {isSavingVote ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Menyimpan…
                                    </>
                                ) : (
                                    "Simpan"
                                )}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            {/* ===== IMAGE PREVIEW MODAL ===== */}
            <Dialog.Root open={previewOpen} onOpenChange={(o) => (o ? setPreviewOpen(true) : closePreview())}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/70" />
                    <Dialog.Content
                        className="fixed left-1/2 z-[61] top-1/2 w-[min(92vw,880px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-3 shadow-2xl outline-none"
                    // onInteractOutside={(e) => e.preventDefault()} // aktifkan jika ingin overlay tidak bisa di klik
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Dialog.Title className="text-sm font-medium truncate pr-4">
                                {previewAlt ?? "Pratinjau Gambar"}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 rounded hover:bg-gray-100">
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <div className="relative">
                            {previewSrc ? (
                                <img
                                    src={previewSrc}
                                    alt={previewAlt ?? ""}
                                    className="max-h-[76vh] w-auto mx-auto object-contain rounded"
                                    loading="eager"
                                />
                            ) : (
                                <div className="h-[60vh] flex items-center justify-center text-gray-500">
                                    Tidak ada gambar.
                                </div>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                            <a
                                href={previewSrc ?? "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                            >
                                Buka di tab baru
                            </a>
                            <Dialog.Close asChild>
                                <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                                    Tutup
                                </button>
                            </Dialog.Close>
                        </div>
                    </Dialog.Content>
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


