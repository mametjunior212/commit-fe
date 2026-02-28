import z from "zod";
import { loginSchema } from "../z/loginSchema";

export type LoginFormData = z.infer<typeof loginSchema>;