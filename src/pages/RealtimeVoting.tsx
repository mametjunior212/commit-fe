import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import * as Progress from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import {
    BarChart as ReBarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
    RefreshCcw,
    Signal,
    WifiOff,
    Activity,
    BarChart3,
    PieChart as PieChartIcon,
    Users,
    CheckCircle2,
    Clock,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Url from "@/Uri/url";
import { useParams } from "react-router-dom";
import { COLORS_Chart } from "@/lib/utils";

// ---- Types ----
export type VoteItem = {
    candidateId: string;
    candidateName: string;
    votes: number;
};
export type VoteResponse = {
    data: VoteItem[];
    updatedAt?: string;
    totaluser: number; // total user aktif saat ini
};

// ---- Config (from .env) ----
const API_URL = Url.Voting_Realtime     || `/api/v1/votes`;
const SSE_URL = ""; // leave empty to disable SSE

// ---- Helpers ----
export const sumVotes = (items: VoteItem[]) => items.reduce((acc, it) => acc + (it.votes ?? 0), 0);

// Normalize to ensure stable data shape
function normalizeResponse(resp?: VoteResponse | null): VoteResponse {
    if (!resp || !Array.isArray(resp.data)) return { data: [], updatedAt: undefined, totaluser: 0 };
    return {
        data: resp.data.map((it) => ({
            candidateId: String(it.candidateId ?? ""),
            candidateName: String(it.candidateName ?? "Unknown"),
            votes: Number(it.votes ?? 0),
        })),
        updatedAt: resp.updatedAt,
        totaluser: Number(resp.totaluser ?? 0),
    };
}

// ---- Live data hook: SSE with polling fallback ----
export function useLiveVotes(pollIntervalMs = 2000) {
    const [sseData, setSseData] = useState<VoteResponse | null>(null);
    const [sseError, setSseError] = useState<Error | null>(null);
    const [usingSSE, setUsingSSE] = useState<boolean>(Boolean(SSE_URL));
    const sseRef = useRef<EventSource | null>(null);
    const { id } = useParams<{ id: string }>();

    // Setup SSE if URL is provided
    useEffect(() => {
        if (!SSE_URL) return;
        const es = new EventSource(SSE_URL);
        sseRef.current = es;

        es.onmessage = (evt) => {
            try {
                const payload = JSON.parse(evt.data);
                setSseData(normalizeResponse(payload));
                setSseError(null);
            } catch (e) {
                // ignore malformed chunks but keep SSE running
                console.error("SSE parse error:", e);
            }
        };
        es.onerror = (err) => {
            console.warn("SSE error, falling back to polling.", err);
            setSseError(new Error("SSE connection failed"));
            setUsingSSE(false);
            try {
                es.close();
            } catch { }
            sseRef.current = null;
        };
        return () => {
            try {
                es.close();
            } catch { }
            sseRef.current = null;
        };
    }, []);

    // Polling via React Query as fallback or when SSE disabled
    const query = useQuery<VoteResponse>({
        queryKey: ["votes", id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}${id}`, { headers: { accept: "application/json" } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as VoteResponse;
            return normalizeResponse(json);
        },
        refetchInterval: usingSSE ? false : pollIntervalMs,
        enabled: !usingSSE, // only enable polling when not using SSE
        staleTime: 1000,
    });

    const data: VoteResponse | null = usingSSE ? sseData : query.data ?? null;
    const isLoading = usingSSE ? !sseData && !sseError : query.isLoading;
    const error = usingSSE ? sseError : (query.error as Error | null);

    return {
        data,
        isLoading,
        error,
        usingSSE,
        refetch: query.refetch,
    };
}

export default function RealtimeVotingPage() {
    return (
        <Layout>
            <PageContent />
        </Layout>
    );
}

// ---- Layout wrapper to match your template ----
function Layout({ children }: { children: React.ReactNode }) {
    // Optional global pointer reactive background (subtle)
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const t = e.currentTarget;
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        t.style.setProperty("--x", x.toString());
        t.style.setProperty("--y", y.toString());
    }, []);
    return (
        <div
            className="min-h-screen bg-background pt-32 pb-16 md:pb-24"
            onMouseMove={handleMouseMove}
            style={{
                backgroundImage:
                    "radial-gradient(600px circle at calc(var(--x,0.5)*100%) calc(var(--y,0.5)*100%), hsl(var(--primary)/0.08), transparent 40%)",
            }}
        >
            <Navigation />
            {children}
            <Footer />
        </div>
    );
}

// ---- Main Page ----
function PageContent() {
    const { data, isLoading, error, usingSSE, refetch } = useLiveVotes(2000);

    const totalVotes = useMemo(() => sumVotes(data?.data ?? []), [data]);
    const totalUsers = data?.totaluser ?? 0; // NEW: total user aktif dari API
    const votedUsers = useMemo(
        () => Math.min(totalVotes, totalUsers), // NEW: batasi agar tidak melebihi total user
        [totalVotes, totalUsers]
    );
    const notVotedUsers = useMemo(
        () => Math.max(0, totalUsers - votedUsers), // NEW: tidak boleh negatif
        [totalUsers, votedUsers]
    );

    const lastUpdated = useMemo(() => {
        if (data?.updatedAt) return new Date(data.updatedAt);
        return new Date();
    }, [data?.updatedAt]);

    // enrich with percentage for UI
    const rows = useMemo(() => {
        const items = data?.data ?? [];
        const total = Math.max(1, totalVotes); // avoid divide-by-zero
        return items
            .slice()
            .sort((a, b) => b.votes - a.votes)
            .map((it, idx) => ({
                ...it,
                percent: (it.votes / total) * 100,
                color: COLORS_Chart[idx % COLORS_Chart.length],
            }));
    }, [data?.data, totalVotes]);

    // chart mode toggle
    const [chart, setChart] = useState<"bar" | "pie">("bar");

    // subtle pointer reactive effect for the outer wrapper
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - left) / width;
        const y = (clientY - top) / height;
        currentTarget.style.setProperty("--mouse-x", x.toString());
        currentTarget.style.setProperty("--mouse-y", y.toString());
    }, []);

    return (
        <div className="min-h-[calc(100vh-120px)]">
            <div className="mx-auto max-w-7xl px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Voting</h1>
                        <p className="text-sm text-muted-foreground">
                            Memantau perolehan suara secara realtime {usingSSE ? "(SSE)" : "(Polling)"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => refetch()}
                            disabled={usingSSE}
                            title={usingSSE ? "Sedang menggunakan SSE (auto update)" : "Muat ulang data"}
                        >
                            <RefreshCcw className="h-4 w-4" /> Refresh
                        </button>
                        <span
                            className={
                                "inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-xs " +
                                (usingSSE
                                    ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                                    : "text-amber-700 border-amber-200 bg-amber-50")
                            }
                        >
                            {usingSSE ? <Signal className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                            {usingSSE ? "Realtime" : "Polling"}
                        </span>
                        <div className="inline-flex overflow-hidden rounded-xl border">
                            <button
                                className={
                                    "flex items-center gap-2 px-3 py-2 text-sm " +
                                    (chart === "bar" ? "bg-primary/10 text-primary" : "hover:bg-accent")
                                }
                                onClick={() => setChart("bar")}
                                title="Bar Chart"
                            >
                                <BarChart3 className="h-4 w-4" /> Bar
                            </button>
                            <button
                                className={
                                    "flex items-center gap-2 px-3 py-2 text-sm " +
                                    (chart === "pie" ? "bg-primary/10 text-primary" : "hover:bg-accent")
                                }
                                onClick={() => setChart("pie")}
                                title="Pie Chart"
                            >
                                <PieChartIcon className="h-4 w-4" /> Pie
                            </button>
                        </div>
                    </div>
                </div>

                {/* NEW: Stat cards for total user, sudah voting, belum voting */}
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">Total User Aktif</div>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="mt-1 text-2xl font-semibold tabular-nums">
                            {totalUsers.toLocaleString("id-ID")}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">Sudah Voting</div>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="mt-1 text-2xl font-semibold tabular-nums">
                            {votedUsers.toLocaleString("id-ID")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {(totalUsers > 0 ? (votedUsers / totalUsers) * 100 : 0).toFixed(1)}%
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">Belum Voting</div>
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="mt-1 text-2xl font-semibold tabular-nums">
                            {notVotedUsers.toLocaleString("id-ID")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {(totalUsers > 0 ? (notVotedUsers / totalUsers) * 100 : 0).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="h-80 animate-pulse rounded-2xl border bg-muted/20" />
                    <div className="h-80 animate-pulse rounded-2xl border bg-muted/20" />
                </div>
            ) : error ? (
                <div className="rounded-2xl border bg-destructive/10 p-6 text-destructive">
                    <div className="font-medium">Gagal memuat data.</div>
                    <div className="text-sm opacity-90">{String(error.message ?? error)}</div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    onMouseMove={handleMouseMove}
                    className="mx-auto max-w-7xl grid gap-6 sm:grid-cols-2"
                >
                    {/* Chart Card */}
                    <div className="relative overflow-hidden rounded-2xl border bg-card p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Total suara</div>
                                <div className="text-2xl font-semibold tabular-nums">
                                    {totalVotes.toLocaleString("id-ID")}
                                </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                                Terakhir diperbarui
                                <br />
                                <span className="font-medium">
                                    {format(lastUpdated, "dd MMM yyyy HH:mm:ss", { locale: localeID })}
                                </span>
                            </div>
                        </div>

                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                {chart === "bar" ? (
                                    <ReBarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="candidateName" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                        <Tooltip
                                            formatter={(value: any) => [Number(value).toLocaleString("id-ID"), "Suara"]}
                                        />
                                        <Legend />
                                        <Bar dataKey="votes" name="Suara">
                                            {rows.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </ReBarChart>
                                ) : (
                                    <RePieChart>
                                        <Pie data={rows} dataKey="votes" nameKey="candidateName" outerRadius={110} label>
                                            {rows.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any, name: any, props: any) => [
                                                `${Number(value).toLocaleString("id-ID")} suara`,
                                                props?.payload?.candidateName ?? name,
                                            ]}
                                        />
                                        <Legend />
                                    </RePieChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* List Card */}
                    <div className="overflow-hidden rounded-2xl border bg-card p-4">
                        <div className="mb-3 text-sm font-medium">Rincian kandidat</div>
                        <div className="space-y-4">
                            {rows.map((it) => (
                                <div key={it.candidateId} className="rounded-xl border p-3">
                                    <div className="mb-1 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-block h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: it.color }}
                                            />
                                            <span className="font-medium">{it.candidateName}</span>
                                        </div>
                                        <div className="tabular-nums text-sm text-muted-foreground">
                                            {it.votes.toLocaleString("id-ID")}{" "}
                                            <span className="opacity-70">({it.percent.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                    <Progress.Root className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <Progress.Indicator
                                            className="h-full w-full flex-1 rounded-full"
                                            style={{
                                                transform: `translateX(-${100 - it.percent}%)`,
                                                backgroundColor: it.color,
                                            }}
                                        />
                                    </Progress.Root>
                                </div>
                            ))}
                            {rows.length === 0 && (
                                <div className="rounded-xl border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                                    Belum ada data kandidat.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}