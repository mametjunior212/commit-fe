import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Url from '@/Uri/url';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

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
        <div className="min-h-screen bg-background selection:bg-accent/20 flex flex-col" >
            <Helmet>
                <title>{data?.title || 'QR Event'}</title>
            </Helmet>

            < Navigation />
            <main className="flex-1 pt-24 md:pt-32 flex md:items-center md:justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-5xl bg-card rounded-3xl shadow-xl p-6 md:p-10 grid md:grid-cols-2 gap-8"
                >
                    {/* LEFT: QR */}
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {data?.title || 'Event'}
                        </h1>

                        {isLoading ? (
                            <p>Loading QR...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <div className="bg-white p-4 rounded-2xl shadow">
                                <img src={qrImageUrl} alt="QR" className="w-60 md:w-80" />
                            </div>
                        )}

                        <p className="text-sm opacity-70">
                            Scan QR untuk absensi
                        </p>
                    </div>

                    {/* RIGHT: DETAIL */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold">Detail Event</h2>
                            <p className="text-sm opacity-70">{data?.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="opacity-60">Tanggal</p>
                                <p className="font-medium">{data?.year}</p>
                            </div>
                            <div>
                                <p className="opacity-60">Peserta</p>
                                <p className="font-medium">{data?.nama_user}</p>
                            </div>
                        </div>

                        <div>
                            <p className="opacity-60 text-sm">About</p>
                            <p className="text-sm leading-relaxed">
                                {data?.about}
                            </p>
                        </div>

                        <div className="bg-muted text-center p-4 rounded-xl text-xs break-all">
                            {data?.absen}
                        </div>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>

    );
};
444
export default EventAbsen;