import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Url from '@/Uri/url';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { formatDate } from '@/components/features/calendar/helpers';

type EventAbsenResponse = {
    title: string;
    absen: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    year?: string;
    about?: string;
    nama_user?: string;
};

const EventAbsen = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<EventAbsenResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const endpoint = useMemo(() => `${Url.EVENT_ABSEN_API}${id ?? ''}`, [id]);

    useEffect(() => {
        const ac = new AbortController();

        async function fetchData(signal?: AbortSignal) {
            const res = await fetch(endpoint, { method: 'POST', signal });
            const json = await res.json();
            return json.data;
        }

        fetchData(ac.signal)
            .then((res) => setData(res))
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));

        return () => ac.abort();
    }, [endpoint]);

    const qrImageUrl = useMemo(() => {
        return data?.absen
            ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(data.absen)}`
            : '';
    }, [data?.absen]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Helmet>
                <title>{data?.title || 'QR Event'}</title>
            </Helmet>
            <Navigation />

            <main className="flex-1 pt-24 md:pt-28 px-4">
                <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

                    {/* LEFT */}
                    <div className="flex flex-col justify-center items-center text-center">
                        <p className="text-xs uppercase tracking-wider text-foreground/50">
                            QR Attendance
                        </p>

                        <h1 className="text-xl md:text-2xl font-semibold mt-2 max-w-xs leading-snug">
                            {data?.title}
                        </h1>

                        <div className="mt-6">
                            <div className="bg-white p-4 rounded-xl border border-foreground/10">
                                <img src={qrImageUrl} className="w-56 md:w-64" />
                            </div>
                        </div>

                        <p className="text-xs text-foreground/60 mt-4 max-w-[220px]">
                            Scan QR menggunakan perangkat resmi
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="p-2 md:p-4 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold">Detail Event</h2>
                            <p className="text-sm text-foreground/70 mt-1 leading-relaxed">
                                {data?.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div>
                                <p className="text-xs text-foreground/50">Tanggal</p>
                                <p className="font-medium">{data?.year}</p>
                            </div>

                            <div>
                                <p className="text-xs text-foreground/50">Peserta</p>
                                <p className="font-medium">{data?.nama_user}</p>
                            </div>

                            <div>
                                <p className="text-xs text-foreground/50">Mulai</p>
                                <p>{formatDate(data?.start_date)}</p>
                            </div>

                            <div>
                                <p className="text-xs text-foreground/50">Selesai</p>
                                <p>{formatDate(data?.end_date)}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-foreground/50 mb-1">About</p>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {data?.about}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-foreground/10">
                            <p className="text-xs text-foreground/50 mb-2">Token</p>
                            <div className="bg-muted rounded-lg p-3 text-xs text-center break-all">
                                {data?.absen}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>

    );
};

export default EventAbsen;