import { z } from "zod";

export const createProjectSchema = z.object({
    title: z.string().min(10, { message: "Title must be at least 10 characters." }),
    description: z.string().min(50, { message: "Please provide a detailed description (min 50 chars)." }),
    goalAmount: z.number().min(100, { message: "Minimum funding goal is $100." }),
    categoryId: z.string().optional(),
});

export const projectTitleSchema = createProjectSchema.shape.title;
export const projectDescriptionSchema = createProjectSchema.shape.description;
export const projectGoalSchema = createProjectSchema.shape.goalAmount;