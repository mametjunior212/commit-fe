import { getParameterByName, useParameter } from "@/hooks/useSetting";
import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";
const Dashboard = () => {
    const storyRef = useRef(null);
    const storyInView = useInView(storyRef, { once: true, margin: '-100px' });

    const { data: apiParameter } = useParameter();

    const struktur = useMemo(
        () => getParameterByName(apiParameter, "Struktur Organisasi About"),
        [apiParameter]
    );

    return (
        <section className="space-y-6">
            <div ref={storyRef} className="max-w-4xl mx-auto text-center mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    {struktur?.value_param ? (
                        <motion.img
                            src={import.meta.env.VITE_FONT_END + struktur.value_param}
                            alt="Struktur Organisasi"
                            className="mx-auto"
                        />
                    ) : (
                        <div>Loading gambar...</div>
                    )}
                </motion.div>

            </div>
        </section>
    );
};
export default Dashboard;