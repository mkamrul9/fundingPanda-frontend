import { z } from "zod";

export const loginSchema = z.object({
    email: z.email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// ... keep existing login schemas

export const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    role: z.enum(["STUDENT", "SPONSOR"], { message: "Please select an account type." }),
    university: z.string().max(100, { message: "University name is too long." }).optional(),
    bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }).optional(),
});


// We extract these specific field schemas so we can use them directly in TanStack Form's onChange validators
export const nameSchema = registerSchema.shape.name;
export const registerEmailSchema = registerSchema.shape.email;
export const registerPasswordSchema = registerSchema.shape.password;
export const registerUniversitySchema = registerSchema.shape.university;
export const registerBioSchema = registerSchema.shape.bio;
export const emailSchema = loginSchema.shape.email;
export const passwordSchema = loginSchema.shape.password;