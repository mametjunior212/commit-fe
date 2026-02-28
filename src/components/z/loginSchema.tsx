import { z } from 'zod';
export const loginSchema = z.object({
    username: z.string().trim().min(1, 'Username is required').min(3, 'Username is required').max(191, 'Username harus kurang dari 191 karakter'),
    password: z.string().trim().min(1, 'Password is required').min(6, 'Password is required').max(191, 'Password harus kurang dari 191 karakter'),
});
