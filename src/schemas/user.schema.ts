import { ResetInput, ProdukInput, PTInput, UpdateInput } from "@/types/userType";
import { zodResolver } from "@hookform/resolvers/zod";
import {  useForm } from "react-hook-form"
import z from "zod";

export const resetSchema = z
    .object({
        current: z.string().trim().min(1, 'Password is Wajib Terisi').min(6, 'Password is Wajib Terisi minimal 6 karakter').max(191, 'Password harus kurang dari 191 karakter'),
        password: z.string().trim().min(1, 'Password is Wajib Terisi').min(6, 'Password is Wajib Terisi minimal 6 karakter').max(191, 'Password harus kurang dari 191 karakter'),
        confirm: z.string().trim().min(1, 'Password is Wajib Terisi').min(6, 'Password is Wajib Terisi minimal 6 karakter').max(191, 'Password harus kurang dari 191 karakter'),
    })
    .refine((d) => d.password === d.confirm, {
        message: "Password tidak sama",
        path: ["confirm"],
    });

export const produkSchema = z.object({
    jenis: z.string().min(1, "Wajib isi"),
    keterangan: z.string().min(1, "Wajib isi"),
    value: z.string().min(1, "Wajib isi"),
});

export const ptSchema = z.object({
    nama: z.string().min(1, "Wajib isi"),
    alamat: z.string().min(1, "Wajib isi"),
    nomor: z.string().min(1, "Wajib isi"),
    kategori: z.string().min(1, "Wajib isi"),
});

export const userSchema = z.object({
    name: z.string().min(1, "Nama Wajib Isi Minimal 1 Huruf"),
    email: z.string().email("Format Email Tidak Sesuai"),
    email_perusahaan: z.string().email("Format Email Tidak Sesuai"),
    nomor: z.string().min(10, "Nomor Telpon Wajib isi Minimal 10 digit"),
    tgl_lahir: z.string().nullable(),
    jenis_kelamin: z.string().nullable(),
    pekerjaan: z.string().min(1, "Pekerjaan Wajib Terisi"),
});