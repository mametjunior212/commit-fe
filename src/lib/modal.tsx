import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export const Modal = ({ open, onClose, children, title }: ModalProps) => {

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ✅ Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ✅ Modal Wrapper */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
          >
            <div
              className="
                w-full max-w-md rounded-xl shadow-xl relative
                bg-white text-black
                dark:bg-zinc-900 dark:text-white
                border border-gray-200 dark:border-zinc-700
              "
              onClick={(e) => e.stopPropagation()}
            >

              {/* ✅ Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                <h2 className="font-semibold text-lg">{title}</h2>

                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ✅ Content */}
              <div className="p-4 space-y-3">
                {children}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
