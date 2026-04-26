import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";

const Maintenance = () => {
    const location = useLocation();

    useEffect(() => {
        console.error("404:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="min-h-[calc(80vh)] bg-background">

            <div
                className="min-h-[calc(80vh)] flex items-center justify-center bg-cover bg-center relative"
                style={{
                    backgroundImage:
                        "url('https://beta.commit-id.org/assets/hero-bg.png')",
                }}
            >
                {/* overlay biar readable */}
                <div className="absolute inset-0 bg-black/40" />

                {/* content */}
                <div className="relative z-10 text-center  px-6">
                    <img
                        src={"data:image/png;base64,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"}
                        alt="Logo"
                        className="mx-auto mb-6 w-40"
                    />

                    <h1 className="text-4xl mb-6">
                        Halaman Web Sedang Dalam Pengembangan
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
