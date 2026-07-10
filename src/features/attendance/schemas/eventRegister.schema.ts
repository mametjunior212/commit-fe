import { z } from "zod";

export const eventRegisterSchema = z.object({
    nama: z
        .string()
        .trim()
        .min(1, "Nama wajib diisi")
        .max(191, "Nama maksimal 191 karakter"),
    nomor: z
        .string()
        .trim()
        .min(10, "Nomor telepon minimal 10 digit")
        .max(15, "Nomor telepon maksimal 15 digit")
        .regex(/^\d+$/, "Nomor telepon hanya boleh berisi angka"),
    pekerjaan_id: z.string().min(1, "Pekerjaan wajib dipilih"),
    email: z.string().trim().email("Format email tidak sesuai"),
    alamat: z.string().trim().min(1, "Alamat wajib diisi"),
    alamat_kantor: z.string().trim().min(1, "Alamat kantor wajib diisi"),
    community: z.string().trim().min(1, "Community wajib diisi"),
    perusahaan: z.string().trim().min(1, "Perusahaan wajib diisi"),
});

export type EventRegisterInput = z.infer<typeof eventRegisterSchema>;

export const eventRegisterDefaultValues: EventRegisterInput = {
    nama: "",
    nomor: "",
    pekerjaan_id: "",
    email: "",
    alamat: "",
    alamat_kantor: "",
    community: "",
    perusahaan: "",
};
