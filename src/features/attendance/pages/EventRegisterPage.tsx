import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import EventRegisterForm from "../components/EventRegisterForm";
import EventRegisterResultModal from "../components/EventRegisterResultModal";
import { useEventRegister, useJobs } from "../hooks/useEventRegister";
import { EventRegisterInput } from "../schemas/eventRegister.schema";

type ResultState = {
    open: boolean;
    success: boolean;
    message: string;
};

const initialResult: ResultState = { open: false, success: true, message: "" };

const EventRegisterPage = () => {
    const { id } = useParams<{ id: string }>();

    const [result, setResult] = useState<ResultState>(initialResult);

    const { data: jobs = [], isLoading: jobsLoading, error: jobsError } = useJobs();

    const { mutate, isPending } = useEventRegister({
        onSuccess: (data) => {
            setResult({
                open: true,
                success: true,
                message: data?.message ?? "Pendaftaran berhasil",
            });
        },
        onError: (error) => {
            setResult({
                open: true,
                success: false,
                message: error.message || "Terjadi kesalahan",
            });
        },
    });

    const handleSubmit = (values: EventRegisterInput) => {
        if (!id) return;

        mutate({
            event_id: id,
            nama: values.nama,
            nomor: values.nomor,
            pekerjaan_id: values.pekerjaan_id,
            email: values.email,
            alamat: values.alamat,
            alamat_kantor: values.alamat_kantor,
            community: values.community,
            perusahaan: values.perusahaan,
        });
    };

    if (!id) return null;

    return (
        <div className="min-h-screen bg-background selection:bg-accent/20">
            <Navigation />

            <Helmet>
                <title>Pendaftaran Event | CommIT</title>
                <meta name="description" content="Halaman pendaftaran peserta event CommIT." />
            </Helmet>

            <main className="relative pt-24 pb-20">
                <div className="container-wide mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-3xl rounded-[2rem] border border-foreground/10 bg-card p-6 shadow-[0_20px_120px_rgba(15,23,42,0.08)] md:p-10"
                    >
                        <div className="mb-8">
                            <p className="text-sm font-mono uppercase tracking-[0.3em] text-accent">
                                Registrasi
                            </p>
                            <h1 className="mt-3 text-3xl font-syne font-bold tracking-tight text-foreground md:text-4xl">
                                Pendaftaran Event
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-foreground/70">
                                Lengkapi data berikut untuk mendaftar.
                            </p>
                        </div>

                        <EventRegisterForm
                            jobs={jobs}
                            jobsLoading={jobsLoading}
                            jobsError={!!jobsError}
                            isSubmitting={isPending}
                            onSubmit={handleSubmit}
                        />
                    </motion.div>
                </div>
            </main>

            <Footer />

            <EventRegisterResultModal
                open={result.open}
                success={result.success}
                message={result.message}
                onClose={() => setResult((prev) => ({ ...prev, open: false }))}
            />
        </div>
    );
};

export default EventRegisterPage;
