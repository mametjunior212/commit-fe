import { z } from "zod";

export const perusahaanSchema = z.object({
    logo: z
        .instanceof(File, {
            message: "Logo wajib diisi",
        })
        .nullable(),
    nama: z
        .string()
        .min(3, "Nama perusahaan minimal 3 karakter"),
    alamat: z
        .string()
        .min(5, "Alamat wajib diisi"),
    nomor: z
        .string()
        .min(5, "Nomor wajib diisi"),
    kategori_bidang_usaha: z
        .string()
        .min(1, "Kategori wajib dipilih"),
});

export type PerusahaanForm = z.infer<typeof perusahaanSchema>;