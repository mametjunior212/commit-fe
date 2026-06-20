import { produkSchema, ptSchema, resetSchema, userSchema } from "@/schemas/user.schema";
import z from "zod";

export type ResetInput = z.infer<typeof resetSchema>;
export type ProdukInput = z.infer<typeof produkSchema>;
export type PTInput = z.infer<typeof ptSchema>;
export type UpdateInput = z.infer<typeof userSchema>;

export type UserResponse = {
    username: string;
    name: string;
    email: string;
    email_perusahaan?: string;
    nomor?: string;
    tgl_lahir?: string;
    jenis_kelamin?: string;
    pekerjaan?: string;

    nama_perusahaan?: string;
    nomor_perusahaan?: string;
    alamat_perusahaan?: string;
    kategori_bidang_usaha_perusahaan?: string;
    logo_perusahaan?: string;

    has_produk?: string;
};