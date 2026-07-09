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
import { ProdukInput, PTInput, ResetInput, UpdateInput, UserResponse } from "@/types/userType";
import { fetcher, fetchJobs, fetchProvinces } from "@/services/api.user.service";
import { produkSchema, ptSchema, resetSchema, ukuranBajuOptions, userSchema } from "@/schemas/user.schema";
import JobSelect from "@/components/sections/MemberPages/JobSelected";
import ProvinceSelect from "@/components/sections/MemberPages/ProvinceSelect";
import ModalSetPerusahaan from "@/components/sections/MemberPages/ModalPerusahaan";
import ResetPasswordModal from "@/components/sections/MemberPages/ResetPasswordModal";
import { ProvinceItem } from "@/components/type/provinceType";

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

    const {
        data: provinces = [],
        isLoading: provinceLoading,
        error: provinceError,
    } = useQuery<ProvinceItem[]>({
        queryKey: ["provinces"],
        queryFn: ({ signal }) => fetchProvinces(signal),
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
            prov_id: "",
            kota: "",
            alamat_lengkap: "",
            ukuran_baju: "",
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
            prov_id: user.uuid_prov ?? "",
            kota: user.kota ?? "",
            alamat_lengkap: user.alamat_lengkap ?? "",
            ukuran_baju: user.ukuran_baju ?? "",
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
                    const error = json as ErrorResponse<{}>;

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
                    json as ErrorResponse<{}>;

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
            qc.invalidateQueries({ queryKey: ["DETAIL_USER"], });
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
                <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                        <h2 className="md:col-span-2 text-lg font-semibold">
                            Profil User
                        </h2>

                        {/* Username */}
                        <div>
                            <Label>Username</Label>
                            <Input value={user.username} disabled className="mt-1" />
                        </div>

                        {/* Nama */}
                        <div>
                            <Label>Nama</Label>
                            <Input {...register("name")} className="mt-1" />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <Label>Email</Label>
                            <Input {...register("email")} className="mt-1" />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Email Perusahaan */}
                        <div>
                            <Label>Email Perusahaan</Label>
                            <Input {...register("email_perusahaan")} className="mt-1" />
                            {errors.email_perusahaan && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.email_perusahaan.message}
                                </p>
                            )}
                        </div>

                        {/* Nomor */}
                        <div>
                            <Label>Nomor</Label>
                            <Input type="number" {...register("nomor")} className="mt-1" />
                            {errors.nomor && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.nomor.message}
                                </p>
                            )}
                        </div>

                        {/* Tanggal Lahir */}
                        <div>
                            <Label>Tanggal Lahir</Label>
                            <Input type="date" {...register("tgl_lahir")} className="mt-1" />
                            {errors.tgl_lahir && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.tgl_lahir.message}
                                </p>
                            )}
                        </div>

                        {/* Jenis Kelamin */}
                        <div>
                            <Label>Jenis Kelamin</Label>
                            <select
                                {...register("jenis_kelamin")}
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm 
                                        bg-white text-black 
                                        dark:bg-[hsl(var(--background))] 
                                        dark:text-white 
                                        dark:border-[hsl(var(--input))]"
                            >
                                <option value="">Pilih</option>
                                <option value="l">Laki-laki</option>
                                <option value="p">Perempuan</option>
                            </select>

                            {errors.jenis_kelamin && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.jenis_kelamin.message}
                                </p>
                            )}
                        </div>

                        {/* Pekerjaan */}
                        <div>
                            <Label>Pekerjaan</Label>
                            <Controller
                                name="pekerjaan"
                                control={control}
                                render={({ field }) => (
                                    <JobSelect
                                        jobs={jobs}
                                        value={field.value}
                                        onChange={field.onChange}
                                        loading={jobLoading}
                                        error={!!jobError}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            {errors.pekerjaan && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.pekerjaan.message}
                                </p>
                            )}
                        </div>

                        {/* Provinsi */}
                        <div>
                            <Label>Provinsi</Label>
                            <Controller
                                name="prov_id"
                                control={control}
                                render={({ field }) => (
                                    <ProvinceSelect
                                        provinces={provinces}
                                        value={field.value}
                                        onChange={field.onChange}
                                        loading={provinceLoading}
                                        error={!!provinceError}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            {errors.prov_id && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.prov_id.message}
                                </p>
                            )}
                        </div>

                        {/* Kota */}
                        <div>
                            <Label>Kota</Label>
                            <Input {...register("kota")} className="mt-1" />
                            {errors.kota && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.kota.message}
                                </p>
                            )}
                        </div>

                        {/* Alamat Lengkap */}
                        <div className="md:col-span-2">
                            <Label>Alamat Lengkap</Label>
                            <Textarea {...register("alamat_lengkap")} className="mt-1" />
                            {errors.alamat_lengkap && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.alamat_lengkap.message}
                                </p>
                            )}
                        </div>

                        {/* Ukuran Baju */}
                        <div>
                            <Label>Ukuran Baju</Label>
                            <select
                                {...register("ukuran_baju")}
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm
                                        bg-white text-black
                                        dark:bg-[hsl(var(--background))]
                                        dark:text-white
                                        dark:border-[hsl(var(--input))]"
                            >
                                <option value="">Pilih</option>
                                {ukuranBajuOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size.toUpperCase()}
                                    </option>
                                ))}
                            </select>

                            {errors.ukuran_baju && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.ukuran_baju.message}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleSubmit(submitUpdate)}
                                className="w-full sm:w-auto"
                            >
                                {isSubmitting ? "Loading..." : "Update Profile"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowReset(true)}
                                className="w-full sm:w-auto"
                            >
                                Reset Password
                            </Button>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* =====================================================
            *                       PERUSAHAAN
            * ===================================================== */}

            <ModalSetPerusahaan user={user}
                onClick={() => setShowPT(true)}
                open={showPT}
                onOpenChange={setShowPT}
                onSelect={(value) => {
                    setSelected(value);
                    setPerusahaanMutation.mutate(value);
                }} />

            {/* =====================================================
            *                       PRODUK
            * ===================================================== */}

            {/* <Card>
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
            </Card> */}


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
            <ResetPasswordModal
                open={showReset}
                onClose={() => setShowReset(false)}
                form={resetForm}
                onSubmit={(data) => resetMutation.mutate(data)}
            />

        </div >
    );
}