import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/lib/modal";

type EventRegisterResultModalProps = {
    open: boolean;
    onClose: () => void;
    success: boolean;
    message: string;
};

export default function EventRegisterResultModal({
    open,
    onClose,
    success,
    message,
}: EventRegisterResultModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={success ? "Berhasil" : "Gagal"}
        >
            <div className="flex flex-col items-center gap-4 py-2 text-center">
                {success ? (
                    <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                ) : (
                    <XCircle className="h-14 w-14 text-red-500" />
                )}

                <p className="whitespace-pre-line text-sm text-foreground/80">
                    {message}
                </p>

                <Button type="button" onClick={onClose} className="w-full">
                    Tutup
                </Button>
            </div>
        </Modal>
    );
}
