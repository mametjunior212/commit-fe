import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import Url from '@/Uri/url';
import { fmtDateTimeIndo } from '@/lib/utils';
import {
    AttendanceColumn,
    AttendanceItem,
    AttendanceParams,
    DataTablesEnvelope,
} from '@/components/type/Datatables';

const PAGE_SIZES = [5, 10, 20, 50, 100] as const;

const COLUMN_CONFIG: { key: AttendanceColumn; label: string }[] = [
    { key: 'nama', label: 'Nama' },
    { key: 'nomor', label: 'Nomor HP' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'alamat_kantor', label: 'Alamat Kantor' },
    { key: 'community', label: 'Community' },
    { key: 'perusahaan', label: 'Perusahaan' },
    { key: 'nama_pekerjaan2', label: 'Pekerjaan' },
    { key: 'email', label: 'Email' },
    { key: 'hadir', label: 'Hadir' },
    { key: 'hall', label: 'Hall' },
    { key: 'tabletop', label: 'Tabletop' },
    { key: 'booth', label: 'Booth' },
    { key: 'created_at', label: 'Waktu Daftar' },
];

const COLUMNS: AttendanceColumn[] = COLUMN_CONFIG.map((c) => c.key);

const FLAG_COLUMNS: AttendanceColumn[] = ['hadir', 'hall', 'tabletop', 'booth'];

type FallbackKey =
    | 'nama_user'
    | 'nomor_hp'
    | 'email_pribadi'
    | 'nama_pekerjaan1'
    | 'alamat_lengkap'
    | 'alamat_perusahaan'
    | 'nama_perusahaan';

// Kolom "tamu" jatuh balik ke data profil user/perusahaan saat kosong/null.
const FALLBACK_SOURCE: Partial<Record<AttendanceColumn, FallbackKey>> = {
    nama: 'nama_user',
    nomor: 'nomor_hp',
    email: 'email_pribadi',
    nama_pekerjaan2: 'nama_pekerjaan1',
    alamat: 'alamat_lengkap',
    alamat_kantor: 'alamat_perusahaan',
    perusahaan: 'nama_perusahaan',
};

function resolveCellValue(row: AttendanceItem, key: AttendanceColumn): AttendanceItem[AttendanceColumn] {
    const primary = row[key];

    if (primary !== null && primary !== undefined && primary !== '') {
        return primary;
    }

    const fallbackKey = FALLBACK_SOURCE[key];

    if (!fallbackKey) return primary;

    return row[fallbackKey] ?? primary;
}

function renderAttendanceCell(key: AttendanceColumn, value: AttendanceItem[AttendanceColumn]) {
    if (FLAG_COLUMNS.includes(key)) {
        return <StatusBadge value={value} />;
    }
    if (key === 'created_at') {
        return fmtDateTimeIndo(value);
    }
    return value ?? '-';
}

// Field yang boleh dipakai backend untuk pencarian global (DataTables columns[].searchable).
const SEARCHABLE_FIELDS = new Set<AttendanceColumn | 'title'>([
    'title',
    'nama',
    'nomor',
    'alamat',
    'email',
    'email_perusahaan',
    'community',
    'perusahaan',
    'nama_pekerjaan2',
]);

const QUERY_COLUMNS: (AttendanceColumn | 'title')[] = [...COLUMNS, 'title'];

function StatusBadge({ value }: { value: AttendanceItem[AttendanceColumn] }) {
    return value === 'y' ? (
        <span className="badge-green">Ya</span>
    ) : (
        <span className="badge-gray">Tidak</span>
    );
}

function useDebouncedValue<T>(value: T, delay = 500) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

function buildAttendanceQuery(params: AttendanceParams) {
    const qs = new URLSearchParams();
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 10;
    const start = (page - 1) * perPage;

    qs.set('draw', '1');
    qs.set('start', String(start));
    qs.set('length', String(perPage));

    if (params.search) qs.set('search[value]', params.search);
    qs.set('search[regex]', 'false');

    const sortColumn = (params.sortBy || COLUMNS[0]) as AttendanceColumn;
    const sortIndex = Math.max(0, QUERY_COLUMNS.indexOf(sortColumn));
    qs.set('order[0][column]', String(sortIndex));
    qs.set('order[0][dir]', params.sortOrder ?? 'asc');

    QUERY_COLUMNS.forEach((column, idx) => {
        qs.set(`columns[${idx}][data]`, column);
        qs.set(`columns[${idx}][name]`, column);
        qs.set(`columns[${idx}][searchable]`, String(SEARCHABLE_FIELDS.has(column)));
        qs.set(`columns[${idx}][orderable]`, 'true');
        qs.set(`columns[${idx}][search][value]`, '');
        qs.set(`columns[${idx}][search][regex]`, 'false');
    });

    return `?${qs.toString()}`;
}

type AttendancePage = {
    rows: AttendanceItem[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        lastPage: number;
        from: number;
        to: number;
    };
};

async function fetchAttendanceList(endpoint: string, params: AttendanceParams, signal?: AbortSignal): Promise<AttendancePage> {
    const query = buildAttendanceQuery(params);
    const res = await fetch(`${endpoint}${query}`, { method: 'POST', signal });

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

export default function Attendance() {
    const { id } = useParams<{ id: string }>();

    const [params, setParams] = React.useState<AttendanceParams>({ page: 1, perPage: 10 });
    const [searchInput, setSearchInput] = React.useState('');

    const debouncedSearch = useDebouncedValue(searchInput, 500);

    React.useEffect(() => {
        if ((params.search ?? '') !== debouncedSearch) {
            setParams((prev) => ({ ...prev, page: 1, search: debouncedSearch }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const endpoint = React.useMemo(() => `${Url.ATTENDANCE_API}${id ?? ''}`, [id]);

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['attendanceList', endpoint, params],
        queryFn: ({ signal }) => fetchAttendanceList(endpoint, params, signal),
        enabled: Boolean(id),
        staleTime: 30_000,
    });

    const rows = data?.rows ?? [];
    const meta = data?.meta;
    const eventTitle = rows[0]?.title || 'Daftar Kehadiran';

    function toggleSort(column: AttendanceColumn) {
        const isSame = params.sortBy === column;
        const nextOrder: 'asc' | 'desc' = isSame && params.sortOrder === 'asc' ? 'desc' : 'asc';
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

// ================= CONTROLS (global filter) =================
type AttendanceControlsProps = {
    searchInput: string;
    onSearchChange: (value: string) => void;
    isFetching: boolean;
    onRefresh: () => void;
    perPage: number;
    onPerPageChange: (perPage: number) => void;
};

function AttendanceControls({
    searchInput,
    onSearchChange,
    isFetching,
    onRefresh,
    perPage,
    onPerPageChange,
}: AttendanceControlsProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari nama / nomor / alamat / email / perusahaan..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border
                            bg-white text-black border-gray-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-500
                            dark:bg-[hsl(var(--background))] dark:text-white dark:border-[hsl(var(--input))]"
                    />
                </div>

                <button
                    onClick={onRefresh}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm
                        bg-gray-100 hover:bg-gray-200 dark:bg-[hsl(var(--secondary))] dark:hover:bg-[hsl(var(--accent))]"
                >
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
                <label className="text-sm text-gray-500 dark:text-gray-400">Tampilkan</label>

                <Select.Root value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                    <Select.Trigger
                        className="inline-flex items-center justify-between rounded-lg border px-3 py-2 min-w-[90px]
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
    );
}

// ================= TABLE =================
type AttendanceTableProps = {
    rows: AttendanceItem[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    sortBy?: AttendanceColumn;
    sortOrder?: 'asc' | 'desc';
    onToggleSort: (column: AttendanceColumn) => void;
};

function AttendanceTable({
    rows,
    isLoading,
    isError,
    errorMessage,
    sortBy,
    sortOrder,
    onToggleSort,
}: AttendanceTableProps) {
    const colSpan = COLUMN_CONFIG.length + 1;

    return (
        <div className="rounded-xl border border-gray-200 dark:border-[hsl(var(--input))] overflow-hidden">
            <div className="w-full overflow-x-auto">
                <table className="min-w-[2400px] w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-[hsl(var(--secondary))]">
                        <tr>
                            <Th label="#" />
                            {COLUMN_CONFIG.map(({ key, label }) => (
                                <Th
                                    key={key}
                                    label={label}
                                    column={key}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={onToggleSort}
                                />
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        <AttendanceTableBody
                            rows={rows}
                            isLoading={isLoading}
                            isError={isError}
                            errorMessage={errorMessage}
                            colSpan={colSpan}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

type AttendanceTableBodyProps = {
    rows: AttendanceItem[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    colSpan: number;
};

function AttendanceTableBody({ rows, isLoading, isError, errorMessage, colSpan }: AttendanceTableBodyProps) {
    if (isLoading) {
        return (
            <>
                {[...Array(5)].map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                        {Array.from({ length: colSpan }).map((__, j) => (
                            <Td key={j}>
                                <div className="h-3 w-full max-w-[120px] bg-gray-200 dark:bg-gray-700 rounded" />
                            </Td>
                        ))}
                    </tr>
                ))}
            </>
        );
    }

    if (isError) {
        return (
            <tr>
                <td colSpan={colSpan} className="px-4 py-6 text-red-600">
                    Terjadi kesalahan. {errorMessage}
                </td>
            </tr>
        );
    }

    if (rows.length === 0) {
        return (
            <tr>
                <td colSpan={colSpan} className="px-4 py-6 text-center text-gray-500">
                    Tidak ada data
                </td>
            </tr>
        );
    }

    return (
        <>
            {rows.map((row, index) => (
                <AttendanceRow key={row.uuid ?? index} row={row} index={index + 1} />
            ))}
        </>
    );
}

function AttendanceRow({ row, index }: { row: AttendanceItem; index: number }) {
    return (
        <tr className="border-t border-gray-100 dark:border-gray-700">
            <Td>{row.DT_RowIndex ?? index}</Td>
            {COLUMN_CONFIG.map(({ key }) => (
                <Td key={key} className={key === 'nama_user' ? 'font-medium' : ''}>
                    {renderAttendanceCell(key, resolveCellValue(row, key))}
                </Td>
            ))}
        </tr>
    );
}

// ================= PAGINATION =================
type AttendancePaginationProps = {
    meta?: AttendancePage['meta'];
    page: number;
    onPageChange: (page: number) => void;
};

function AttendancePagination({ meta, page, onPageChange }: AttendancePaginationProps) {
    const lastPage = meta?.lastPage ?? 1;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                {meta ? (
                    <>
                        Menampilkan <b>{meta.from}-{meta.to}</b> dari <b>{meta.total}</b>
                    </>
                ) : (
                    '-'
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

// ================= HEADER CELLS =================
type ThProps = {
    label: string;
    column?: AttendanceColumn;
    sortBy?: AttendanceColumn;
    sortOrder?: 'asc' | 'desc';
    onSort?: (column: AttendanceColumn) => void;
};

function Th({ label, column, sortBy, sortOrder, onSort }: ThProps) {
    if (!column) {
        return <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300">{label}</th>;
    }

    const isActive = sortBy === column;
    const indicator = isActive ? (sortOrder === 'asc' ? '▲' : '▼') : '';

    return (
        <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 select-none">
            <button
                type="button"
                onClick={() => onSort?.(column)}
                className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white"
            >
                {label}
                {indicator && <span className="text-xs">{indicator}</span>}
            </button>
        </th>
    );
}

function Td({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
    return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
