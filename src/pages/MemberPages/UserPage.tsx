import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Url from "@/Uri/url";
import { Label } from "@radix-ui/react-label";
import { Modal } from "@/lib/modal";
import { JobItem } from "@/components/type/pekerjaanType";
import { toast } from "@/hooks/use-toast";
import { ErrorResponse, SuccessResponse } from "@/components/type/response";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import ModalPerusahaan from "@/components/modal/modal-perusahaan";
import { Perusahaan } from "@/types/perusahaan.type";

/* =========================================================
 * SCHEMA
 * ========================================================= */

const resetSchema = z
    .object({
        current: z.string().trim().min(1, 'Password is Wajib Terisi').min(6, 'Password is Wajib Terisi minimal 6 karakter').max(191, 'Password harus kurang dari 191 karakter'),
        password: z.string().trim().min(1, 'Password is Wajib Terisi').min(6, 'Password is Wajib Terisi minimal 6 karakter').max(191, 'Password harus kurang dari 191 karakter'),
        confirm: z.string().trim().min(1, 'Password is Wajib Terisi').min(6, 'Password is Wajib Terisi minimal 6 karakter').max(191, 'Password harus kurang dari 191 karakter'),
    })
    .refine((d) => d.password === d.confirm, {
        message: "Password tidak sama",
        path: ["confirm"],
    });

const produkSchema = z.object({
    jenis: z.string().min(1, "Wajib isi"),
    keterangan: z.string().min(1, "Wajib isi"),
    value: z.string().min(1, "Wajib isi"),
});

const ptSchema = z.object({
    nama: z.string().min(1, "Wajib isi"),
    alamat: z.string().min(1, "Wajib isi"),
    nomor: z.string().min(1, "Wajib isi"),
    kategori: z.string().min(1, "Wajib isi"),
});

const userSchema = z.object({
    name: z.string().min(1, "Nama Wajib Isi Minimal 1 Huruf"),
    email: z.string().email("Format Email Tidak Sesuai"),
    email_perusahaan: z.string().email("Format Email Tidak Sesuai"),
    nomor: z.string().min(10, "Nomor Telpon Wajib isi Minimal 10 digit"),
    tgl_lahir: z.string().nullable(),
    jenis_kelamin: z.string().nullable(),
    pekerjaan: z.string().min(1, "Pekerjaan Wajib Terisi"),
});

/* =========================================================
 * TYPES
 * ========================================================= */

type ResetInput = z.infer<typeof resetSchema>;
type ProdukInput = z.infer<typeof produkSchema>;
type PTInput = z.infer<typeof ptSchema>;
type UpdateInput = z.infer<typeof userSchema>;

type UserResponse = {
    username: string;
    name: string;
    email: string;
    email_perusahaan?: string;
    nomor?: string;
    tgl_lahir?: string;
    jenis_kelamin?: string;
    pekerjaan?: string;

    nama_perusahaan?: string;
    nomor_perusahaan?: string;
    alamat_perusahaan?: string;
    kategori_bidang_usaha_perusahaan?: string;
    logo_perusahaan?: string;

    has_produk?: string;
};

/* =========================================================
 * API HELPERS
 * ========================================================= */

async function fetcher<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(url, options);

    if (!res.ok) {
        throw new Error(`Request gagal: ${res.status}`);
    }

    return res.json();
}

async function fetchJobs(
    signal?: AbortSignal
): Promise<JobItem[]> {
    const res = await fetch(Url.Jobs_API ?? "/api/menu", {
        signal,
    });

    if (!res.ok) {
        throw new Error(
            `Gagal mengambil pekerjaan: ${res.status}`
        );
    }

    const json =
        (await res.json()) as
        | SuccessResponse
        | { data?: JobItem[] };

    if (Array.isArray(json)) return json;

    if (Array.isArray(json?.data)) {
        return json.data;
    }

    return [];
}

/* =========================================================
 * JOB SELECT COMPONENT
 * ========================================================= */

type JobSelectProps = {
    jobs: JobItem[];
    value?: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
    loading?: boolean;
    error?: boolean;
};

function JobSelect({
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


/* =========================================================
 * PAGE
 * ========================================================= */

export default function UserPage() {
    const qc = useQueryClient();

    const token = `Bearer ${atob(localStorage.getItem("access_token") ?? "")}`;

    const [showPassword, setShowPassword] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [selected, setSelected] = useState<Perusahaan | null>(null);


    /* =========================================================
     * MODAL STATE
     * ========================================================= */

    const [showPT, setShowPT] = useState(false);
    const [showProduk, setShowProduk] = useState(false);
    const [showReset, setShowReset] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    /* =========================================================
     * QUERY
     * ========================================================= */

    const { data: user, isLoading } =
        useQuery<UserResponse>({
            queryKey: ["DETAIL_USER"],
            queryFn: async () => {
                const json = await fetcher<{
                    data: UserResponse;
                }>(Url.DETAIL_USER, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                });

                return json.data;
            },
        });

    const {
        data: jobs = [],
        isLoading: jobLoading,
        error: jobError,
    } = useQuery<JobItem[]>({
        queryKey: ["jobs"],
        queryFn: ({ signal }) => fetchJobs(signal),
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });

    /* =========================================================
     * FORMS
     * ========================================================= */

    const resetForm = useForm<ResetInput>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            current: "",
            password: "",
            confirm: "",
        },
    });

    const produkForm = useForm<ProdukInput>({
        resolver: zodResolver(produkSchema),
    });

    const ptForm = useForm<PTInput>({
        resolver: zodResolver(ptSchema),
    });

    const updateForm = useForm<UpdateInput>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            email_perusahaan: "",
            nomor: "",
            tgl_lahir: "",
            jenis_kelamin: "",
            pekerjaan: "",
        },
    });

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = updateForm;

    /* =========================================================
     * SET DEFAULT VALUE
     * ========================================================= */

    useEffect(() => {
        if (!user) return;

        reset({
            name: user.name ?? "",
            email: user.email ?? "",
            email_perusahaan:
                user.email_perusahaan ?? "",
            nomor: user.nomor ?? "",
            tgl_lahir: user.tgl_lahir
                ? user.tgl_lahir.slice(0, 10)
                : "",
            jenis_kelamin:
                user.jenis_kelamin ?? "",
            pekerjaan: user.pekerjaan ?? "",
        });
    }, [user, reset]);

    /* =========================================================
     * MUTATIONS
     * ========================================================= */

    const produkMutation = useMutation({
        mutationFn: async (data: ProdukInput) =>
            fetch("/api/addProduk", { method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify(data), }),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["DETAIL_USER"], });

            setShowProduk(false);

            toast({
                title: "Berhasil",
                description:
                    "Produk berhasil ditambahkan",
            });
        },
    });

    const ptMutation = useMutation({
        mutationFn: async (data: PTInput) => {
            const fd = new FormData();

            Object.entries(data).forEach(([key, value]) => { fd.append(key, String(value)); });

            return fetch("/api/addPerusahaan", { method: "POST", body: fd, });
        },

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["user"], });

            setShowPT(false);

            toast({
                title: "Berhasil",
                description:
                    "Perusahaan berhasil ditambahkan",
            });
        },
    });

    /* =========================================================
     * MUTATIONS SET PERUSAHAAN
     * ========================================================= */

    const setPerusahaanMutation = useMutation({
        mutationFn: async (value: Perusahaan) => {
            const resp = await fetch(Url.SET_PERUSAHAAN_USER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    uuidPt: value.uuid,
                }),
            });

            if (!resp.ok) {
                throw new Error("Gagal set perusahaan");
            }

            return resp.json();
        },

        onSuccess: () => {
            toast({
                title: "Berhasil",
                description: "Perusahaan berhasil diset",
            });

            // 🔥 INI INTI NYA
            qc.invalidateQueries({ queryKey: ["DETAIL_USER"] });

            setShowPT(false);
        },

        onError: (err: Error) => {
            toast({
                title: "Gagal",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    /* =========================================================
     * MUTATIONS RESET PASSWORD
     * ========================================================= */

    const resetMutation = useMutation({
        mutationFn: async (data: ResetInput) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            try {
                const resp = await fetch(Url.RESET_PASSWORD, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: JSON.stringify(data),
                    signal: controller.signal,
                });

                const isJson = resp.headers
                    .get("content-type")
                    ?.includes("application/json");

                const json = isJson ? await resp.json() : null;

                if (!resp.ok) {
                    const error = json as ErrorResponse;

                    const fieldErrors =
                        typeof error?.data === "object"
                            ? (error.data as Record<string, unknown>)
                            : {};

                    const messages = Object.entries(fieldErrors)
                        .flatMap(([field, msgs]) =>
                            Array.isArray(msgs)
                                ? msgs.map((msg) => `${field}: ${msg}`)
                                : []
                        )
                        .join("\n");

                    throw new Error(
                        messages ||
                        error?.message ||
                        "Reset password gagal"
                    );
                }

                return json;
            } finally {
                clearTimeout(timeout);
            }
        },

        onSuccess: () => {
            resetForm.reset();
            setShowReset(false);
            toast({
                title: "Berhasil",
                description: "Password berhasil direset",
            });
        },

        onError: (err: unknown) => {
            if ((err as Error).name === "AbortError") {
                toast({
                    title: "Timeout",
                    description: "Permintaan terlalu lama",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description:
                        (err as Error).message || "Terjadi kesalahan",
                    variant: "destructive",
                });
            }
        },
    });

    /* =========================================================
     * SUBMIT UPDATE PROFILE
     * ========================================================= */

    const submitUpdate = async (
        data: UpdateInput
    ) => {
        setIsSubmitting(true);

        const controller = new AbortController();

        const timeout = setTimeout(() => { controller.abort(); }, 30000);

        try {
            const selected = jobs.find(
                (j) => j.uuid.toLowerCase() === String(data.pekerjaan).toLowerCase()
            );

            const payload = {
                ...data,
                pekerjaan: selected ? selected.uuid : null,
            };

            const resp = await fetch(
                Url.UPDATE_USER,
                {
                    method: "POST",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                }
            );

            const isJson = resp.headers.get("content-type")?.includes("application/json");

            const json = isJson ? await resp.json() : null;

            if (!resp.ok) {
                const error =
                    json as ErrorResponse;

                const fieldErrors =
                    typeof error?.data === "object" ? (error.data as Record<string, unknown>) : {};

                const messages = Object.entries(
                    fieldErrors
                )
                    .flatMap(([field, msgs]) => Array.isArray(msgs) ? msgs.map((msg) => `${field}: ${msg}`) : [])
                    .join("\n");

                toast({
                    title: "Update gagal",
                    description:
                        messages ||
                        error?.message ||
                        "Terjadi kesalahan",
                    variant: "destructive",
                });

                return;
            }

            toast({
                title: "Berhasil",
                description:
                    "Profile berhasil diupdate",
            });

            qc.invalidateQueries({
                queryKey: ["user"],
            });
        } catch (err: unknown) {
            if (
                (err as Error).name ===
                "AbortError"
            ) {
                toast({
                    title: "Timeout",
                    description:
                        "Permintaan terlalu lama",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description:
                        (err as Error).message,
                    variant: "destructive",
                });
            }
        } finally {
            clearTimeout(timeout);
            setIsSubmitting(false);
        }
    };

    /* =========================================================
     * LOADING
     * ========================================================= */

    if (isLoading) {
        return (
            <div className="p-6">Loading...</div>
        );
    }

    if (!user) return null;

    /* =========================================================
     * RENDER
     * ========================================================= */

    return (
        <div className="mx-auto grid w-full gap-6">
            {/* =====================================================
            *                         USER
            * ===================================================== */}
            <Card>
                <CardContent className="grid grid-cols-2 gap-4 p-6">
                    <h2 className="col-span-2 text-lg font-bold">
                        Profil User
                    </h2>

                    <div>
                        <Label>Username</Label>
                        <Input value={user.username} disabled />
                    </div>

                    <div>
                        <Label>Nama</Label>
                        <Input {...register("name")} />

                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input {...register("email")} />
                        {errors.email && (
                            <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>Email Perusahaan</Label>

                        <Input
                            {...register("email_perusahaan")}
                        />
                        {errors.email_perusahaan && (
                            <p className="mt-2 text-sm text-destructive">{errors.email_perusahaan.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>Nomor</Label>

                        <Input
                            type="number" {...register("nomor")}
                        />
                        {errors.nomor && (
                            <p className="mt-2 text-sm text-destructive">{errors.nomor.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>
                            Tanggal Lahir
                        </Label>

                        <Input
                            type="date" {...register("tgl_lahir")}
                        />
                        {errors.tgl_lahir && (
                            <p className="mt-2 text-sm text-destructive">{errors.tgl_lahir.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>
                            Jenis Kelamin
                        </Label>

                        <select {...register("jenis_kelamin")} className="w-full rounded-md border px-4 py-2  bg-white text-black  dark:bg-[hsl(var(--background))]  dark:text-white  dark:border-[hsl(var(--input))">
                            <option value="">Pilih</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                        {errors.jenis_kelamin && (
                            <p className="mt-2 text-sm text-destructive">{errors.jenis_kelamin.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>Pekerjaan</Label>

                        <Controller name="pekerjaan" control={control} render={({ field }) => (
                            <JobSelect jobs={jobs} value={field.value} onChange={field.onChange} loading={jobLoading} error={!!jobError} disabled={isSubmitting} />
                        )} />

                        {errors.pekerjaan && (<p className="mt-1 text-sm text-red-500"> {errors.pekerjaan.message} </p>)}
                    </div>

                    <div className="col-span-2 flex justify-end gap-3">
                        <Button type="button" disabled={isSubmitting} onClick={handleSubmit(submitUpdate)}>
                            {isSubmitting
                                ? "Loading..."
                                : "Update Profile"}
                        </Button>

                        <Button type="button" variant="outline" onClick={() => setShowReset(true)}>
                            Reset Password
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* =====================================================
            *                       PERUSAHAAN
            * ===================================================== */}

            <Card>
                <CardContent className="space-y-4 p-6">
                    {user.nama_perusahaan && <>
                        <h2 className="text-lg font-semibold">
                            Perusahaan / Property
                        </h2>

                        <div className="flex items-center gap-4 border-b pb-4">
                            <img
                                src={(import.meta as ImportMeta).env.VITE_FONT_END + user.logo_perusahaan}
                                alt="logo"
                                className="h-16 w-16 rounded border object-contain"
                            />

                            <div>
                                <h3 className="text-xl font-bold">
                                    {user.nama_perusahaan}
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    {user.kategori_bidang_usaha_perusahaan}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>
                                    Nama Perusahaan/Nama Property
                                </Label>

                                <Input
                                    value={user.nama_perusahaan ?? ""}
                                    disabled
                                />
                            </div>

                            <div>
                                <Label>Nomor</Label>

                                <Input
                                    value={user.nomor_perusahaan ?? ""}
                                    disabled
                                />
                            </div>

                            <div className="col-span-2">
                                <Label>Domisili</Label>
                                <Textarea
                                    disabled
                                    value={user.alamat_perusahaan ?? ""}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label>Kategori</Label>

                                <Input
                                    value={user.kategori_bidang_usaha_perusahaan ?? ""}
                                    disabled
                                />
                            </div>
                        </div>
                    </>
                    }
                    <div className="flex items-center justify-between">
                        {user.nama_perusahaan === null &&
                            < p className="text-muted-foreground">
                                Belum ada perusahaan
                            </p>
                        }

                        <Button
                            onClick={() =>
                                setShowPT(true)
                            }
                        >
                            Set Perusahaan
                        </Button>
                        <ModalPerusahaan
                            open={showPT}
                            onOpenChange={setShowPT}
                            onSelect={(value) => {
                                setSelected(value);
                                setPerusahaanMutation.mutate(value);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* =====================================================
            *                       PRODUK
            * ===================================================== */}

            <Card>
                <CardContent className="p-6">
                    {user.nama_perusahaan &&
                        (
                            <Button
                                onClick={() =>
                                    setShowProduk(true)
                                }
                            >
                                Tambah Produk
                            </Button>
                        )}
                </CardContent>
            </Card>


            {/* =====================================================
            *                       MODAL CREATE PT
            * ===================================================== */}

            {/* <Modal
                open={showPT}
                onClose={() => setShowPT(false)}
                title="Tambah Perusahaan"
            >
                <form
                    className="space-y-3"
                    onSubmit={ptForm.handleSubmit(
                        (data) =>
                            ptMutation.mutate(data)
                    )}
                >
                    <Input
                        placeholder="Nama"
                        {...ptForm.register("nama")}
                    />

                    <Input
                        placeholder="Alamat"
                        {...ptForm.register(
                            "alamat"
                        )}
                    />

                    <Input
                        placeholder="Nomor"
                        {...ptForm.register(
                            "nomor"
                        )}
                    />

                    <Input
                        placeholder="Kategori"
                        {...ptForm.register(
                            "kategori"
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Simpan
                    </Button>
                </form>
            </Modal> */}

            {/* =====================================================
            *                       MODAL PRODUK
            * ===================================================== */}

            <Modal
                open={showProduk}
                onClose={() =>
                    setShowProduk(false)
                }
                title="Tambah Produk"
            >
                <form
                    className="space-y-3"
                    onSubmit={produkForm.handleSubmit(
                        (data) =>
                            produkMutation.mutate(data)
                    )}
                >
                    <Input
                        placeholder="Jenis"
                        {...produkForm.register(
                            "jenis"
                        )}
                    />

                    <Textarea
                        placeholder="Keterangan"
                        {...produkForm.register(
                            "keterangan"
                        )}
                    />

                    <Input
                        placeholder="Value"
                        {...produkForm.register(
                            "value"
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Simpan
                    </Button>
                </form>
            </Modal>

            {/* =====================================================
            *                   MODAL RESET PASSWORD
            * ===================================================== */}

            <Modal
                open={showReset}
                onClose={() =>
                    setShowReset(false)
                }
                title="Reset Password"
            >
                <form
                    className="space-y-3"
                    onSubmit={resetForm.handleSubmit((data) => resetMutation.mutate(data))}
                >
                    {/* PASSWORD LAMA */}
                    <div className="relative">
                        <Input type={showCurrent ? "text" : "password"} placeholder="Password Lama Anda" {...resetForm.register("current")} />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* PASSWORD BARU */}
                    <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Password"    {...resetForm.register("password")} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* CONFIRM */}
                    <div className="relative">
                        <Input type={showConfirm ? "text" : "password"} placeholder="Confirm Password"    {...resetForm.register("confirm")} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {resetForm.formState.errors.confirm && (
                        <p className="text-sm text-red-500">
                            {resetForm.formState.errors.confirm.message}
                        </p>
                    )}

                    <Button type="submit" className="w-full">
                        Reset Password
                    </Button>
                </form>

            </Modal>
        </div >
    );
}