import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, useEffect, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogIn, Send, UserPlus } from 'lucide-react';
import Url from '@/Uri/url';
import { ErrorResponse, SuccessResponse } from '../type/response';
import { useQuery } from '@tanstack/react-query';
import { loginSchema } from '../z/loginSchema';
import { registerSchema } from '../z/registerSchema';
import { LoginFormData } from '../type/loginType';
import { JobItem } from '../type/pekerjaanType';
import { RegisterFormData } from '../type/registerType';


export const HeroSection = () => {
    const ref = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState('');

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 0.5], ['0%', '10%']);
    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
    const springX = useSpring(cursorX, { stiffness: 100, damping: 20 });
    const springY = useSpring(cursorY, { stiffness: 100, damping: 20 });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    // Login Form
    const {
        register: signin,
        handleSubmit,
        formState: { errors: login_errors },
        reset,
    } = useForm<LoginFormData>({
        mode: 'onSubmit',
        resolver: zodResolver(loginSchema),
    });

    const setIsRegistering = (value: boolean) => {
        setIsLogin(!value);
    }
    // Submit Saat Login
    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);
        // Opsional: timeout supaya fetch nggak ngegantung
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s

        try {
            const resp = await fetch(Url.Login_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Tambahkan Authorization/Custom header jika diperlukan
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password,
                }),
                // credentials: 'include', // kalau pakai cookie httpOnly di server
                signal: controller.signal,
            });

            // Cek content-type untuk aman parsing JSON
            const isJson = resp.headers.get('content-type')?.includes('application/json');
            const payload = isJson ? await resp.json() : null;

            if (!resp.ok) {
                // Tangani error dari server
                const apiErr = (payload || {}) as ErrorResponse;

                const message =
                    apiErr.message ||
                    (typeof payload === 'string' ? payload : undefined) ||
                    `Login gagal (status ${resp.status})`;

                toast({
                    title: 'Login gagal',
                    description: message,
                    variant: 'destructive',
                });
                return;
            }

            // Berhasil
            const dataOk = payload as SuccessResponse;
            if (!dataOk?.data?.token) {
                // Kalau backend tidak kirim token
                toast({
                    title: 'Login berhasil sebagian',
                    description: 'Respons tidak berisi token. Hubungi admin backend.',
                });
                return;
            }

            // Simpan token (disesuaikan kebutuhanmu)
            localStorage.setItem('access_token', dataOk.data.token);

            toast({
                title: 'Login sukses!',
                description: `Selamat datang${dataOk.data.user?.username ? `, ${dataOk.data.user.username}` : ''}.`,
            });

            // Opsional: redirect atau trigger state global (Zustand/Redux)
            // navigate('/dashboard');

            reset();
        } catch (err: unknown) {
            if ((err as Error).name === 'AbortError') {
                toast({
                    title: 'Timeout',
                    description: 'Permintaan login melebihi batas waktu. Coba lagi.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Kesalahan jaringan',
                    description: (err as Error).message || 'Tidak dapat terhubung ke server.',
                    variant: 'destructive',
                });
            }
        } finally {
            clearTimeout(timeout);
            setIsSubmitting(false);
            reset();
            resetregist();
            setIsLogin(true);
        }
    };

    // Register Form
    const {
        register: regist,
        setValue: registSetValue,
        handleSubmit: handleRegister,
        formState: { errors: regist_errors },
        reset: resetregist,
        control: registControl,
    } = useForm<RegisterFormData>({
        defaultValues: {
            username: '',
            nama: '',
            email: '',
            nomorwa: '',
            namaperushaan: '',
            pekerjaan: '',   // <- penting: controlled dari awal
            password: '',
        },
        resolver: zodResolver(registerSchema),
    });
    // Submit Saat Register
    const onRegister = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        // Opsional: timeout supaya fetch nggak ngegantung
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s

        try {
            const selected = jobs.find(j => j.uuid.toLowerCase() === String(data.pekerjaan || '').toLowerCase());
            data = {
                ...data,
                pekerjaan: selected ? selected.uuid : null, // kirim id ke server
            };

            const resp = await fetch(Url.Register_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Tambahkan Authorization/Custom header jika diperlukan
                },
                body: JSON.stringify(data),
                // credentials: 'include', // kalau pakai cookie httpOnly di server
                signal: controller.signal,
            });

            // Cek content-type untuk aman parsing JSON
            const isJson = resp.headers.get('content-type')?.includes('application/json');
            const payload = isJson ? await resp.json() : null;

            // Tangani error dari server
            if (!resp.ok) {
                const dataError = (payload || {}) as ErrorResponse;
                // Normalisasi field errors (bisa object kosong)
                const fieldErrors =
                    (dataError && typeof dataError.data === 'object' && dataError.data !== null
                        ? (dataError.data as Record<string, unknown>)
                        : {}) ?? {};

                // Ambil pesan pertama tiap field jika ada
                const summary = Object.entries(fieldErrors)
                    .flatMap(([field, msgs]) =>
                        Array.isArray(msgs) && msgs.length > 0 && typeof msgs[0] === 'string'
                            ? `${field}: ${msgs[0]}`
                            : []
                    )
                    // .slice(0, 4) // batasi agar toast tidak kepanjangan
                    .join(' \n• ');

                const items = summary
                    ? summary.split('\n• ').map((t) => t.replace(/^•\s?/, '')) // bersihkan bullet yang sudah ada
                    : [];


                // Fallback kalau data kosong {}
                const fallback =
                    (typeof dataError?.errors === 'string' && dataError.errors) ||
                    (typeof dataError?.message === 'string' && dataError.message) ||
                    'Input tidak valid.';

                toast({
                    title: 'Registrasi gagal',
                    description:
                        items.length ? (
                            <ul className="list-disc pl-5">
                                {items.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        ) : (
                            <div>Kode: {dataError?.code ?? '-'} • {fallback}</div>
                        ),
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Register sukses!',
                description: `Akun Berhasil dibuat Silahkan Cek Email Untuk Verifikasi Akun.`,
            });
            setIsLogin(true); // Kembali ke form login setelah register sukses
            // Opsional: redirect atau trigger state global (Zustand/Redux)
            // navigate('/dashboard');
            resetregist();
        } catch (err: unknown) {
            if ((err as Error).name === 'AbortError') {
                toast({
                    title: 'Timeout',
                    description: 'Permintaan login melebihi batas waktu. Coba lagi.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Kesalahan jaringan',
                    description: (err as Error).message || 'Tidak dapat terhubung ke server.',
                    variant: 'destructive',
                });
            }
        } finally {
            clearTimeout(timeout);
            setIsSubmitting(false);
            // Clear Saat Pindah Form Login/Register
            reset();
            resetregist();
        }
    };




    // Pengisian ListPekerjaan (contoh statis, bisa diganti dengan fetch dari API)
    const {
        data: apiJobs = [],
        isLoading: jobLoading,
        error: jobError,
    } = useQuery<JobItem[]>({
        queryKey: ['jobs'] as const,
        queryFn: ({ signal }) => fetchJobs(signal),
        staleTime: Infinity,         // data selalu fresh
        gcTime: Infinity,            // cache tidak dibersihkan selama sesi
        refetchOnWindowFocus: false, // tidak refetch otomatis
    });

    const jobs = useMemo<JobItem[]>(() => {
        return apiJobs;
    }, [apiJobs]);

    // Ambil data pekerjaan saat mount
    async function fetchJobs(signal?: AbortSignal): Promise<JobItem[]> {
        const res = await fetch(Url.Jobs_API ?? '/api/menu', { signal });
        if (!res.ok) {
            throw new Error(`Gagal mengambil menu: ${res.status} ${res.statusText}`);
        }
        const json = (await res.json()) as SuccessResponse | { data?: JobItem[] };
        if (Array.isArray(json)) {
            return json; // sudah array JobItem[]
        }
        if (Array.isArray(json?.data)) {
            return json.data;
        }
        return [];

    }



    // Update waktu setiap detik
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Jakarta'
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        cursorX.set(e.clientX - rect.left);
        cursorY.set(e.clientY - rect.top);
        setMousePosition({
            x: (e.clientX - rect.left - rect.width / 2) / 50,
            y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
    };

    return (
        <section
            ref={ref}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background */}
            <motion.div className="absolute inset-0" style={{ y: bgY }}>
                <img
                    src="/assets/hero-bg.png"
                    alt=""
                    className="w-full h-full object-cover opacity-100 scale-110"
                />
                <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
            </motion.div>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ paddingTop: 'var(--nav-offset)' }}
            >
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-px bg-foreground/5"
                        style={{ top: `${12.5 * (i + 1)}%` }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                    />
                ))}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-foreground/5"
                        style={{ left: `${16.66 * (i + 1)}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.8 + i * 0.05, duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                    />
                ))}
            </div>

            {/* Floating orb - hidden on mobile for performance */}
            <motion.div
                className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-none bg-accent/10 blur-[80px] md:blur-[120px] hidden sm:block"
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Geometric shapes - hidden on mobile */}
            <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 45 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="absolute top-1/4 left-[10%] w-12 h-12 md:w-20 md:h-20 border border-foreground/10 hidden sm:block"
                style={{
                    x: mousePosition.x * 2,
                    y: mousePosition.y * 2,
                }}
            />
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
                className="absolute bottom-1/4 right-[15%] w-20 h-20 md:w-32 md:h-32 rounded-none border border-accent/20 hidden sm:block"
                style={{
                    x: mousePosition.x * -3,
                    y: mousePosition.y * -3,
                }}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
                className="absolute top-[60%] left-[20%] w-2 h-2 bg-accent rounded-none hidden md:block"
                style={{
                    x: mousePosition.x * 4,
                    y: mousePosition.y * 4,
                }}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1.2 }}
                className="absolute top-[30%] right-[25%] w-3 h-3 bg-foreground/20 rounded-none hidden md:block"
                style={{
                    x: mousePosition.x * -2,
                    y: mousePosition.y * -2,
                }}
            />

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute right-8 top-[30%] -translate-y-1/2 hidden lg:flex flex-col items-center gap-4"
            >
                <span className="text-xs font-mono text-muted-foreground">{currentTime}</span>
                <div className="w-px h-12 bg-foreground/20" />
                <span className="text-xs font-mono text-muted-foreground">WIB</span>
            </motion.div>

            {/* Main content */}
            <motion.div style={{ y }} className="w-full container-wide relative z-10 pt-24 sm:pt-32 pb-20 sm:pb-32 md:pb-48">
                {isLogin ?
                    (<div className="md:max-w-5xl md:mx-auto">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 lg:mx-[10rem] border border-border shadow-andrika rounded-lg bg-card/100">
                            {/* Corner decorations */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-accent/30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-accent/30" />

                            {/* Username Field */}
                            <div>
                                <label htmlFor="login_username" className="block text-sm font-medium mb-2">
                                    Username <span className="text-accent">*</span>
                                </label>
                                <input
                                    id="login_username"
                                    type="text"
                                    {...signin('username')}
                                    className={`w-full px-4 py-4 bg-background border-2 transition-colors focus:outline-none ${login_errors.username
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-accent'
                                        }`}
                                    placeholder="Your username"
                                />
                                {login_errors.username && (
                                    <p className="mt-2 text-sm text-destructive">{login_errors.username.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="login_password" className="block text-sm font-medium mb-2">
                                    Password <span className="text-accent">*</span>
                                </label>
                                <input
                                    id="login_password"
                                    type="password"
                                    {...signin('password')}
                                    className={`w-full px-4 py-4 bg-background border-2 transition-colors focus:outline-none ${login_errors.password
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-accent'
                                        }`}
                                    placeholder="your password"
                                />
                                {login_errors.password && (
                                    <p className="mt-2 text-sm text-destructive">{login_errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full mt-8 py-4 bg-white text-black font-semibold text-base rounded-full flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <LogIn className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                        <motion.div className="mt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Belum punya akun?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(true)}
                                    className="text-accent hover:underline"
                                >
                                    Daftar sekarang
                                </button>
                            </p>
                        </motion.div>
                    </div>) :
                    (<div className="md:max-w-5xl md:mx-auto">
                        <form onSubmit={handleRegister(onRegister)} className="space-y-6 p-8 border border-border shadow-andrika rounded-lgbg-card/30">
                            {/* Corner decorations */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-accent/30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-accent/30" />

                            {/* Username Field */}
                            <div>
                                <label htmlFor="register_username" className="block text-sm font-medium mb-2">
                                    username <span className="text-accent">*</span>
                                </label>
                                <input
                                    id="register_username"
                                    type="text"
                                    disabled={isSubmitting}
                                    {...regist('username')}
                                    className={`w-full px-4 py-4 bg-background border-2 transition-colors focus:outline-none ${regist_errors.username
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-accent'
                                        }`}
                                    placeholder="Your name"
                                />
                                {regist_errors.username && (
                                    <p className="mt-2 text-sm text-destructive">{regist_errors.username.message}</p>
                                )}
                            </div>

                            {/* Nama Field */}
                            <div>
                                <label htmlFor="register_nama" className="block text-sm font-medium mb-2">
                                    nama <span className="text-accent">*</span>
                                </label>
                                <input
                                    id="register_nama"
                                    type="text"
                                    disabled={isSubmitting}
                                    {...regist('nama')}
                                    className={`w-full px-4 py-4 bg-background border-2 transition-colors focus:outline-none ${regist_errors.nama
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-accent'
                                        }`}
                                    placeholder="Your name"
                                />
                                {regist_errors.nama && (
                                    <p className="mt-2 text-sm text-destructive">{regist_errors.nama.message}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email <span className="text-accent">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    disabled={isSubmitting}
                                    {...regist('email')}
                                    className={`w-full px-4 py-4 bg-background border-2 transition-colors focus:outline-none ${regist_errors.email
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-accent'
                                        }`}
                                    placeholder="your@email.com"
                                />
                                {regist_errors.email && (
                                    <p className="mt-2 text-sm text-destructive">{regist_errors.email.message}</p>
                                )}
                            </div>

                            {/* Nomor WA Field */}
                            <div>
                                <label htmlFor="nomor_wa" className="block text-sm font-medium mb-2">
                                    Nomor WhatsApp
                                </label>
                                <input
                                    id="nomor_wa"
                                    type="text"
                                    disabled={isSubmitting}
                                    {...regist('nomorwa')}
                                    className={`w-full px-4 py-4 bg-background border-2 transition-colors focus:outline-none ${regist_errors.nomorwa
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-accent'
                                        }`}
                                    placeholder="Your WhatsApp number (optional)"
                                />
                            </div>

                            {/* Company Field */}
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium mb-2">
                                    Nama Perusahaan
                                </label>
                                <input
                                    id="company"
                                    type="text"
                                    disabled={isSubmitting}
                                    {...regist('namaperushaan')}
                                    className={`w-full px-4 py-4 bg-background border-2 transition-colors focus:outline-none ${regist_errors.namaperushaan
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-accent'
                                        }`}
                                    placeholder="Your company (optional)"
                                />
                            </div>

                            {/* Pekerjaan Field */}
                            <div>

                                <label htmlFor="pekerjaan_search" className="block text-sm font-medium mb-2">
                                    Pekerjaan
                                </label>

                                <Controller
                                    name="pekerjaan"
                                    disabled={isSubmitting}
                                    control={registControl}
                                    render={({ field }) => {
                                        const [open, setOpen] = useState(false);
                                        const [query, setQuery] = useState('');
                                        const containerRef = useRef<HTMLDivElement | null>(null);

                                        const filtered = useMemo(() => {
                                            const q = query.trim().toLowerCase();
                                            if (!q) return jobs;
                                            return jobs.filter(j => j.label.toLowerCase().includes(q));
                                        }, [jobs, query]);

                                        // Sinkronkan query jika value sudah ada (ubah ke label)
                                        useEffect(() => {
                                            const current = jobs.find(j => String(j.uuid) === String(field.value));
                                            if (current) setQuery(current.label);
                                        }, [field.value, jobs]);

                                        // Tutup saat klik di luar
                                        useEffect(() => {
                                            const onClickOutside = (e: MouseEvent) => {
                                                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                                                    setOpen(false);
                                                }
                                            };
                                            document.addEventListener('mousedown', onClickOutside);
                                            return () => document.removeEventListener('mousedown', onClickOutside);
                                        }, []);

                                        const handleSelect = (jobId: string | number, jobLabel: string) => {
                                            field.onChange(jobId);     // simpan ID ke form
                                            setQuery(jobLabel);        // tampilkan label di input
                                            setOpen(false);
                                        };

                                        const disabled = jobLoading || !!jobError;

                                        return (
                                            <div ref={containerRef} className="relative">
                                                <input
                                                    id="jabatan_search"
                                                    type="text"
                                                    value={query}
                                                    placeholder={jobLoading ? 'Memuat pilihan…' : jobError ? 'Gagal memuat pilihan' : 'Ketik untuk mencari jabatan'}
                                                    onChange={(e) => {
                                                        setQuery(e.target.value);
                                                        setOpen(true);
                                                        // Jika user edit manual, kosongkan value id agar validasi konsisten
                                                        if (field.value) field.onChange('');
                                                    }}
                                                    onFocus={() => setOpen(true)}
                                                    disabled={disabled}
                                                    className="w-full px-4 py-4 bg-background border-2 border-border focus:border-accent transition-colors focus:outline-none"
                                                    aria-autocomplete="list"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    aria-controls="jabatan_listbox"
                                                />

                                                {/* Dropdown */}
                                                {open && !disabled && (
                                                    <div
                                                        id="jabatan_listbox"
                                                        role="listbox"
                                                        className="absolute z-20 mt-1 w-full max-h-56 overflow-auto border border-border bg-background shadow"
                                                    >
                                                        {filtered.length === 0 ? (
                                                            <div className="px-4 py-3 text-sm text-muted-foreground">Tidak ada hasil</div>
                                                        ) : (
                                                            filtered.map((job) => (
                                                                <button
                                                                    key={job.uuid}
                                                                    type="button"
                                                                    role="option"
                                                                    aria-selected={String(field.value) === String(job.uuid)}
                                                                    className="w-full text-left px-4 py-2 hover:bg-accent/10 cursor-pointer bg-background text-foreground"
                                                                    onClick={() => handleSelect(job.uuid, job.label)}
                                                                >
                                                                    {job.label}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                )}

                                                {/* Simpan ID tersembunyi (untuk RHF & submit) */}
                                                <input type="hidden" {...field} />
                                            </div>
                                        );
                                    }}
                                />
                                {regist_errors.pekerjaan && (
                                    <p className="mt-2 text-sm text-destructive">{regist_errors.pekerjaan.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="login_password" className="block text-sm font-medium mb-2">
                                    Password <span className="text-accent">*</span>
                                </label>
                                <input
                                    id="login_password"
                                    type="password"
                                    disabled={isSubmitting}
                                    {...regist('password')}
                                    className={`w-full px-4 py-4 bg-background border-2 transition-colors focus:outline-none ${regist_errors.password
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-accent'
                                        }`}
                                    placeholder="your password"
                                />
                                {regist_errors.password && (
                                    <p className="mt-2 text-sm text-destructive">{regist_errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full mt-8 py-4 bg-white text-black font-semibold text-base rounded-full flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Register
                                        <UserPlus className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                        <motion.div className="mt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Sudah punya akun?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(false)}
                                    className="text-accent hover:underline"
                                >
                                    Login sekarang
                                </button>
                            </p>
                        </motion.div>
                    </div>)}

            </motion.div>

        </section>
    );
};

export default HeroSection;
