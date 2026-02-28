import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ErrorResponse, SuccessResponse } from '../type/response';
import { useNavigate } from "react-router-dom";
import Url from '@/Uri/url';

// Helper: ekstrak uuid dari URL /verifikasi/:id
function getUuidFromPath(): string | null {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/\/verifikasi\/([^\/?#]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
}

// Helper: deteksi pesan expired dari response
function isExpiredResponse(resp: Response, payload: any): boolean {
    const code = (payload?.code ?? '').toString().toUpperCase();
    const msg = (payload?.message ?? '').toString().toLowerCase();
    return (
        resp.status === 410 ||
        code === 'OTP_EXPIRED' ||
        msg.includes('expired') ||
        msg.includes('kadaluwarsa') ||
        msg.includes('kadaluarsa')
    );
}

// Helper: deteksi verified dari response
function isVerifiedResponse(resp: Response, payload: any): boolean {
    const status = (payload?.data?.status ?? payload?.status ?? '').toString().toLowerCase();
    const msg = (payload?.message ?? '').toString().toLowerCase();
    return resp.ok && (status === 'success' || msg.includes('Verifikasi'));
}

export default function VerifyOtpSection() {
    const navigate = useNavigate();

    const [uuid, setUuid] = useState<string | null>(null);
    const [stage, setStage] = useState<'loading' | 'notfound' | 'form'>('loading');
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [expired, setExpired] = useState<boolean>(false);

    // OTP as array of 6 digits
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    // Resend cooldown (detik)
    const RESEND_COOLDOWN = 60;
    const [cooldown, setCooldown] = useState<number>(0);

    // Ekstrak UUID saat mount, lalu validasi user ke /auth-service/register
    useEffect(() => {
        const id = getUuidFromPath();
        setUuid(id);

        // Jika tidak ada id, langsung not found
        if (!id) {
            setStage('notfound');
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        (async () => {
            try {
                const resp = await fetch(Url.VERIFY_USER, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uuid: id }),
                    signal: controller.signal,
                });

                // Jika backend mengembalikan JSON
                const isJson = resp.headers.get('content-type')?.includes('application/json');
                const payload = isJson ? await resp.json() : null;

                if (!resp.ok) {
                    // user tidak ditemukan
                    setStage('notfound');
                    return;
                }

                // success → tampilkan form OTP
                setStage('form');
            } catch (err: any) {
                if (err?.name === 'AbortError') {
                    toast({ title: 'Timeout', description: 'Permintaan melebihi batas waktu. Coba lagi.', variant: 'destructive' });
                } else {
                    toast({ title: 'Kesalahan jaringan', description: err?.message ?? 'Tidak dapat terhubung ke server.', variant: 'destructive' });
                }
                // fallback aman → notfound agar user dapat instruksi cek email
                setStage('notfound');
            } finally {
                clearTimeout(timer);
            }
        })();

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, []);

    // Auto focus ke digit pertama saat form tampil
    useEffect(() => {
        if (stage === 'form') {
            setTimeout(() => {
                inputsRef.current[0]?.focus();
            }, 10);
        }
    }, [stage]);

    // Cooldown ticker
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);

    const handleChangeDigit = (index: number, value: string) => {
        // Ambil hanya angka dan 1 char
        const v = value.replace(/\D/g, '').slice(0, 1);

        setOtpDigits((prev) => {
            const next = [...prev];
            next[index] = v;
            return next;
        });

        // Pindah fokus ke berikutnya bila terisi
        if (v && index < inputsRef.current.length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            // Kosong & backspace → mundur
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (text.length) {
            e.preventDefault();
            const arr = text.split('');
            setOtpDigits((prev) => {
                const next = [...prev];
                for (let i = 0; i < 6; i++) next[i] = arr[i] ?? '';
                return next;
            });
            // Fokus ke akhir
            const last = Math.min(text.length, 6) - 1;
            inputsRef.current[last]?.focus();
        }
    };

    const submitOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uuid) return;
        if (otpValue.length !== 6) {
            setErrorMsg('Masukkan 6 digit kode OTP.');
            return;
        }

        setErrorMsg('');
        setSubmitting(true);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        try {
            const resp = await fetch(Url.VERIFY_OTP_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid, otp: otpValue }),
                signal: controller.signal,
            });

            const isJson = resp.headers.get('content-type')?.includes('application/json');
            const payload = isJson ? await resp.json() : null;

            if (isExpiredResponse(resp, payload)) {
                setExpired(true);
                setCooldown(RESEND_COOLDOWN);
                toast({ title: 'Kode OTP kedaluwarsa', description: 'Silakan klik "Kirim ulang kode".' });
                return;
            }

            if (!resp.ok) {
                const apiErr = (payload ?? {}) as ErrorResponse;
                const msg =
                    (typeof apiErr?.message === 'string' && apiErr.message) ||
                    (typeof apiErr?.errors === 'string' && apiErr.errors) ||
                    'Verifikasi gagal. Coba lagi.';
                // setErrorMsg(msg);
                toast({ title: apiErr.status, description: msg, variant: 'destructive' });
                return;
            }

            // Verified → redirect ke "/"
            if (isVerifiedResponse(resp, payload)) {
                const apiErr = (payload ?? {}) as SuccessResponse;
                const msg =
                    (typeof apiErr?.message === 'string' && apiErr.message) ||
                    'Message Tidak Ada';
                toast({ title: 'Berhasil diverifikasi', description: msg });
                navigate("/")
                return;
            }

            // Kalau sukses tapi tidak ada sinyal "verified", tetap redirect
            // window.location.assign('/');
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                toast({ title: 'Timeout', description: 'Permintaan melebihi batas waktu. Coba lagi.', variant: 'destructive' });
            } else {
                toast({ title: 'Kesalahan jaringan', description: err?.message ?? 'Tidak dapat terhubung ke server.', variant: 'destructive' });
            }
        } finally {
            clearTimeout(timer);
            setSubmitting(false);
        }
    };

    const resendCode = async () => {
        if (!uuid) return;
        setResending(true);
        setErrorMsg('');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        try {
            const resp = await fetch(Url.RESEND_OTP_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid }),
                signal: controller.signal,
            });

            const isJson = resp.headers.get('content-type')?.includes('application/json');
            const payload = isJson ? await resp.json() : null;

            if (!resp.ok) {
                const apiErr = (payload ?? {}) as ErrorResponse;
                const msg =
                    (typeof apiErr?.message === 'string' && apiErr.message) ||
                    (typeof apiErr?.errors === 'string' && apiErr.errors) ||
                    'Gagal mengirim ulang kode.';
                setErrorMsg(msg);
                return;
            }

            setExpired(false);
            setOtpDigits(['', '', '', '', '', '']);
            inputsRef.current[0]?.focus();
            setCooldown(RESEND_COOLDOWN);
            toast({ title: 'Kode terkirim', description: 'Silakan cek email / SMS untuk kode OTP terbaru.' });
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                toast({ title: 'Timeout', description: 'Permintaan melebihi batas waktu. Coba lagi.', variant: 'destructive' });
            } else {
                toast({ title: 'Kesalahan jaringan', description: err?.message ?? 'Tidak dapat terhubung ke server.', variant: 'destructive' });
            }
        } finally {
            clearTimeout(timer);
            setResending(false);
        }
    };

    // ====== UI ======
    if (stage === 'loading') {
        return (
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 border border-border rounded-lg bg-card/100 shadow-andrika flex items-center gap-3"
                >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memuat verifikasi…</span>
                </motion.div>
            </section>
        );
    }

    if (stage === 'notfound') {
        return (
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg w-full mx-4 p-8 border border-border rounded-lg bg-card/100 shadow-andrika text-center"
                >
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <p className="text-base font-medium">
                        user tidak ditemukan mohon untuk cek email kembali
                    </p>
                </motion.div>
            </section>
        );
    }

    // stage === 'form'
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mx-4 p-8 border border-border rounded-lg bg-card/100 shadow-andrika"
            >
                <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                    <h2 className="text-lg font-semibold">Verifikasi OTP</h2>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                    Masukkan 6 digit kode OTP yang kami kirimkan. Kode berlaku terbatas.
                </p>

                <form onSubmit={submitOtp} className="space-y-6">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputsRef.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={otpDigits[i]}
                                onChange={(e) => handleChangeDigit(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl bg-background border-2 border-border focus:border-accent focus:outline-none rounded-md"
                                aria-label={`Digit OTP ${i + 1}`}
                            />
                        ))}
                    </div>

                    {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

                    <motion.button
                        type="submit"
                        disabled={submitting || otpValue.length !== 6}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full mt-2 py-3 bg-white text-black font-semibold rounded-full flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memverifikasi…
                            </>
                        ) : (
                            <>
                                Verifikasi
                                <Send className="w-5 h-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Resend Area - hanya tampil saat expired */}
                {expired && (
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Kode OTP kedaluwarsa?
                        </span>
                        <button
                            type="button"
                            onClick={resendCode}
                            disabled={resending || cooldown > 0}
                            className="text-sm text-accent hover:underline disabled:opacity-50"
                        >
                            {resending
                                ? 'Mengirim…'
                                : cooldown > 0
                                    ? `Kirim ulang (${cooldown}s)`
                                    : 'Kirim ulang kode'}
                        </button>
                    </div>
                )}
            </motion.div>
        </section>
    );
}
