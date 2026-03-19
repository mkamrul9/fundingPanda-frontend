import { z } from "zod";

export const loginSchema = z.object({
    email: z.email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// We extract these specific field schemas so we can use them directly in TanStack Form's onChange validators
export const emailSchema = loginSchema.shape.email;
export const passwordSchema = loginSchema.shape.password;