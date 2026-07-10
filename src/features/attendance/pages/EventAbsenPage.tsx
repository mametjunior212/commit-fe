import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Url from '@/Uri/url';

type EventAbsenResponse = {
  title: string;
  absen: string;
};

const EventAbsenPage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<EventAbsenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => `${Url.EVENT_ABSEN_API}${id ?? ''}`, [id]);

  useEffect(() => {
    const ac = new AbortController();

    async function fetchEventAbsen(signal?: AbortSignal): Promise<EventAbsenResponse> {
      if (!id) {
        throw new Error('ID event tidak ditemukan.');
      }

      const res = await fetch(endpoint, { signal });
      if (!res.ok) {
        throw new Error(`Gagal mengambil data: ${res.status} ${res.statusText}`);
      }

      const json = (await res.json()) as EventAbsenResponse;
      if (!json || typeof json.absen !== 'string') {
        throw new Error('Respons API tidak memiliki format QR code yang valid.');
      }

      return json;
    }

    setIsLoading(true);
    setError(null);

    fetchEventAbsen(ac.signal)
      .then((payload) => setData(payload))
      .catch((err: any) => {
        if (err?.name === 'AbortError') return;
        setError(err?.message ?? 'Terjadi kesalahan saat memuat QR code.');
        setData(null);
      })
      .finally(() => setIsLoading(false));

    return () => ac.abort();
  }, [endpoint, id]);

  const pageTitle = useMemo(() => data?.title ?? 'QR Absen Event', [data?.title]);
  const qrValue = useMemo(() => data?.absen ?? '', [data?.absen]);
  const qrImageUrl = useMemo(
    () => qrValue ? `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrValue)}` : '',
    [qrValue]
  );

  if (!id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background selection:bg-accent/20">
      <Navigation />
      <Helmet>
        <title>{pageTitle} | CommIT</title>
        <meta name="description" content="Halaman QR code absensi event CommIT." />
      </Helmet>

      <main className="relative pt-24 pb-20">
        <div className="container-wide mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl rounded-[2rem] border border-foreground/10 bg-card p-8 shadow-[0_20px_120px_rgba(15,23,42,0.08)]"
          >
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-mono uppercase tracking-[0.3em] text-accent">QR Absensi</p>
                <h1 className="mt-3 text-4xl font-syne font-bold tracking-tight text-foreground">{pageTitle}</h1>
              </div>
              <Link to="/event" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80">
                <ArrowLeft className="h-4 w-4" /> Kembali ke Event
              </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-6 rounded-[2rem] border border-foreground/10 bg-background p-8">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.25em] text-foreground/50">Token QR</p>
                  <p className="text-base leading-7 text-foreground/80">
                    QR code dibentuk dari nilai absen yang dikirimkan backend. Scan QR di perangkat absen resmi untuk mencatat kehadiran.
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-foreground/20 bg-foreground/5 text-sm text-foreground/60">
                    Memuat QR code...
                  </div>
                ) : error ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-red-300 bg-red-50 p-6 text-center text-sm text-red-700">
                    <p className="font-semibold text-red-800">Tidak dapat memuat QR code</p>
                    <p className="mt-2">{error}</p>
                  </div>
                ) : (
                  <div className="rounded-[2rem] border border-foreground/10 bg-muted p-8 text-center">
                    {qrValue ? (
                      <div className="mx-auto inline-flex items-center justify-center rounded-[2rem] bg-white p-6 shadow-lg">
                        <img src={qrImageUrl} alt="QR Code absensi" className="mx-auto max-w-full" />
                      </div>
                    ) : (
                      <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-foreground/20 bg-foreground/5 text-sm text-foreground/60">
                        Nilai QR belum tersedia.
                      </div>
                    )}
                  </div>
                )}
              </section>

              <aside className="space-y-6 rounded-[2rem] border border-foreground/10 bg-background p-8">
                <div className="rounded-[1.75rem] border border-foreground/10 bg-foreground/5 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-foreground/50">Detail Event</p>
                  <h2 className="mt-4 text-2xl font-semibold text-foreground">{pageTitle}</h2>
                  <p className="mt-3 text-sm leading-6 text-foreground/70">
                    ID event: <span className="font-mono text-sm text-foreground">{id}</span>
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-foreground/10 bg-foreground/5 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-foreground/50">String Absen</p>
                  <pre className="mt-4 max-h-40 overflow-auto rounded-2xl bg-background/80 p-4 text-sm text-foreground/80">
                    {qrValue || 'Tidak ada data absen tersedia.'}
                  </pre>
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventAbsenPage;
