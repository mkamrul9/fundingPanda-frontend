import { z } from "zod";

export const profileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }).optional(),
    university: z.string().max(100, { message: "University name is too long." }).optional(),
});

export const nameSchema = profileSchema.shape.name;
export const bioSchema = profileSchema.shape.bio;
export const universitySchema = profileSchema.shape.university;