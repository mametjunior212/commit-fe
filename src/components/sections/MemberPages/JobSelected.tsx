import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "../../ui/input";
import { JobItem } from "@/components/type/pekerjaanType";


type JobSelectProps = {
    jobs: JobItem[];
    value?: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
    loading?: boolean;
    error?: boolean;
};

export default function JobSelect({
    jobs,
    value,
    onChange,
    disabled,
    loading,
    error,
}: JobSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const containerRef = useRef<HTMLDivElement | null>(null);

    const filteredJobs = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) return jobs;

        return jobs.filter((job) =>
            job.label.toLowerCase().includes(q)
        );
    }, [jobs, query]);

    useEffect(() => {
        const selected = jobs.find(
            (j) => String(j.uuid) === String(value)
        );

        if (selected) {
            setQuery(selected.label);
        }
    }, [jobs, value]);

    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleOutside);

        return () => {
            document.removeEventListener(
                "click",
                handleOutside
            );
        };
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <Input
                value={query}
                disabled={disabled || loading || error}
                placeholder={
                    loading
                        ? "Memuat..."
                        : error
                            ? "Gagal memuat"
                            : "Cari pekerjaan"
                }
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onChange("");
                    setOpen(true);
                }}
                className="w-full caret-black px-4 py-4 bg-background border-2 border-border focus:border-accent transition-colors focus:outline-none"
            />

            {open && filteredJobs.length > 0 && (
                <div className="absolute left-0 mt-1 w-full z-[9999] max-h-56 overflow-y-auto border border-border bg-background shadow overscroll-contain">
                    {filteredJobs.map((job) => (
                        <div
                            key={job.uuid}
                            className="cursor-pointer px-4 py-2 hover:bg-accent/10"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                onChange(String(job.uuid));
                                setQuery(job.label);
                                setOpen(false);
                            }}
                            onWheel={(e) => {
                                e.stopPropagation();

                                const el = e.currentTarget;
                                const delta = e.deltaY;

                                const atTop = el.scrollTop === 0;
                                const atBottom =
                                    el.scrollHeight - el.scrollTop === el.clientHeight;

                                // ✅ prevent page scroll kalau masih bisa scroll di dropdown
                                if (
                                    (delta < 0 && !atTop) ||
                                    (delta > 0 && !atBottom)
                                ) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            {job.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}