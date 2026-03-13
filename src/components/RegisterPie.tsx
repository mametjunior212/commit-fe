import { COLORS_Chart, shuffleArray } from '@/lib/utils';
import { useMemo } from 'react'
import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
    ResponsiveContainer,
    type TooltipProps,
    Legend,
    LabelList,
} from 'recharts'

type AttendanceDatum = { name: string; value: number; group: 'attendance' }
type RoleDatum = { name: string; value: number; group: 'roles' }

type Props = {
    attendance: Array<Omit<AttendanceDatum, 'group'>>
    rolesPresent: Array<Omit<RoleDatum, 'group'>>
    updateAt?: string
}

function AttendanceTooltip({ active, payload }: TooltipProps<number, string>) {
    if (!active || !payload || payload.length === 0) return null

    // item pertama biasanya yang paling relevan untuk pie yang sedang di-hover
    const entry = payload[0]
    const datum = entry?.payload as (AttendanceDatum | RoleDatum | undefined)
    const color = entry?.color || (entry?.payload as any)?.fill
    const name = entry?.name ?? datum?.name
    const value = entry?.value as number | undefined
    const group = (datum as any)?.group as 'attendance' | 'roles' | undefined

    return (
        <div
            className="rounded-lg border border-border bg-[#0b1220] px-3 py-2 text-sm shadow"
            style={{ minWidth: 140 }}
        >
            <div className="mb-1 flex items-center gap-2">
                <span
                    className="inline-block h-2 w-2 rounded-full text-white"
                    style={{ background: color }}
                />
                <span className="opacity-80 text-white">
                    {group === 'attendance' ? 'Kehadiran' : 'Jabatan Hadir'}
                </span>
            </div>
            <div className="font-medium text-white">{String(name)}</div>
            <div className="text-xs text-white opacity-80">Jumlah: {value ?? 0}</div>
        </div>
    )
}

export default function RegisterPie(props: Props) {
    // Tambahkan flag group ke data (agar tooltip tahu pie mana)

    const attendance = useMemo<AttendanceDatum[]>(
        () => (props.attendance ?? [])
            .filter((d) => (d?.value ?? 0) > 0)
            .map((d) => ({ ...d, group: "attendance" as const })),
        [props.attendance]
    );

    const rolesPresent = useMemo<RoleDatum[]>(
        () => (props.rolesPresent ?? [])
            .filter((d) => (d?.value ?? 0) > 0)
            .map((d) => ({ ...d, group: "roles" as const })),
        [props.rolesPresent]
    );

    // Total per grup (gunakan reduce, dependency benar)
    const totalPT = useMemo(
        () => attendance.reduce((acc, cur) => acc + (Number(cur.value) || 0), 0),
        [attendance]
    );

    const totalRole = useMemo(
        () => rolesPresent.reduce((acc, cur) => acc + (Number(cur.value) || 0), 0),
        [rolesPresent]
    );

    // Validasi konsistensi (opsional)
    const warnMismatch = totalPT !== 0 && totalPT !== totalRole;



    return (
        <div className="card w-full h-full">
            {warnMismatch && (
                <div className="mb-3 text-xs  text-amber-300">
                    ⚠️ Jumlah role ({totalRole}) tidak sama dengan total Hadir ({totalPT}).
                </div>
            )}


            <div className="relative overflow-hidden rounded-2xl border bg-card p-4">
                {/* Header summary */}
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <div className="text-sm text-muted-foreground">Total peserta</div>
                        <div className="text-2xl font-semibold tabular-nums">
                            {totalRole}
                        </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                        Terakhir diperbarui
                        <br />
                        <span className="font-medium">
                            {props.updateAt}
                        </span>
                    </div>
                </div>

                {/* Body: dua pie chart berdampingan seperti konsep awal */}
                <div className="h-[40vh]"> {/* tinggi maksimum 40vh */}
                    <div className="grid h-full min-h-0 grid-cols-2 gap-4"> {/* min-h-0 penting */}
                        {/* Chart 1: Roles yang hadir */}
                        <div className="flex min-h-0 flex-col">
                            <div className="mb-1 text-xs font-medium text-muted-foreground">
                                Pendaftaran Event Berdasarkan Pekerjaan
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart
                                        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                                        style={{ overflow: "visible" }} // hindari clipping label/slice
                                    >
                                        <Pie
                                            data={rolesPresent}
                                            dataKey="value"
                                            innerRadius={40}
                                            outerRadius={110}
                                            stroke="none"
                                            paddingAngle={1}
                                            cx="40%" // geser ke kiri agar ada ruang legend di kanan
                                            cy="50%"
                                        >
                                            {rolesPresent.map((_, i) => (
                                                <Cell key={`role-${i}`} fill={COLORS_Chart[i % COLORS_Chart.length]} />
                                            ))}
                                            <LabelList
                                                position="inside"
                                                formatter={(val: number) => {
                                                    const pct = totalRole > 0 ? (Number(val) / totalRole) * 100 : 0;
                                                    return pct < 4 ? "" : `${pct.toFixed(0)}%`;
                                                }}
                                                fill="#fff"
                                                fontSize={12}
                                                fontWeight={200}
                                            />
                                        </Pie>
                                        <Tooltip content={<AttendanceTooltip />} />
                                        <Legend
                                            layout="vertical"
                                            align="right"
                                            verticalAlign="middle"
                                            wrapperStyle={{
                                                maxHeight: 0.9 * (window.innerHeight * 0.4), // ~90% dari 40vh
                                                overflowY: "auto",
                                                paddingRight: 8,
                                                fontSize: "12px"
                                            }}
                                            iconType="circle"
                                            formatter={(value: string, entry: any) => {
                                                const v = entry?.payload?.value ?? 0;
                                                const pct = totalRole > 0 ? Math.round((v / totalRole) * 100) : 0;
                                                return `${value} (${v}) (${pct}%)`;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Kehadiran */}
                        <div className="flex min-h-0 flex-col">
                            <div className="mb-1 text-xs font-medium text-muted-foreground">
                                Pendaftaran Event Berdasarkan Perusahaan
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart
                                        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                                        style={{ overflow: "visible" }}
                                    >
                                        <Pie
                                            data={attendance}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={40}
                                            outerRadius={110}
                                            stroke="none"
                                            paddingAngle={1}
                                            cx="40  %"
                                            cy="50%"
                                        >
                                            {attendance.map((_, i) => (
                                                <Cell key={`att-${i}`} fill={COLORS_Chart[i % COLORS_Chart.length]} />
                                            ))}
                                            <LabelList
                                                position="inside"
                                                formatter={(val: number) => {
                                                    const pct = totalPT > 0 ? (Number(val) / totalPT) * 100 : 0;
                                                    return pct < 4 ? "" : `${pct.toFixed(0)}%`;
                                                }}
                                                fill="#fff"
                                                fontSize={12}
                                                fontWeight={200}
                                            />
                                        </Pie>
                                        <Tooltip content={<AttendanceTooltip />} />
                                        <Legend
                                            layout="vertical"
                                            align="right"
                                            verticalAlign="middle"
                                            wrapperStyle={{
                                                maxHeight: 0.9 * (window.innerHeight * 0.4),
                                                overflowY: "auto",
                                                paddingRight: 8,
                                                fontSize: "12px"
                                            }}
                                            iconType="circle"
                                            formatter={(value: string, entry: any) => {
                                                const v = entry?.payload?.value ?? 0;
                                                const pct = totalPT > 0 ? Math.round((v / totalPT) * 100) : 0;
                                                return `${value} (${v}) (${pct}%)`;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}