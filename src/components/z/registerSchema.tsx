import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().trim().min(1, 'Username is required').min(3, 'Username is required').max(191, 'Username harus kurang dari 191 karakter'),
    nama: z.string().trim().min(3, 'Nama is required').max(191, 'Nama harus kurang dari 191 karakter'),
    email: z.string().trim().min(1, 'Email is required').max(191, 'Email harus kurang dari 191 karakter').email('Invalid email address'),
    nomorwa: z.string().trim().min(1, 'WhatsApp number is required').max(191, 'WhatsApp number harus kurang dari 191 karakter'),
    namaperushaan: z.string().trim().min(1, 'Nama Perusahaan is required').max(191, 'Nama Perusahaan harus kurang dari 191 karakter'),
    pekerjaan: z.string().trim().min(1, 'Jabatan is required').max(191, 'Jabatan harus kurang dari 191 karakter'),
    password: z.string().trim().min(1, 'Password is required').min(6, 'Password is required').max(191, 'Password harus kurang dari 191 karakter'),
});