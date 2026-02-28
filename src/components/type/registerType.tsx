import z from "zod";
import { registerSchema } from "../z/registerSchema";

export type RegisterFormData = z.infer<typeof registerSchema>;