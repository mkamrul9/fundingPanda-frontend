"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { getCategories, createProject } from "@/services/project.service";
import { createProjectSchema, projectTitleSchema, projectDescriptionSchema, projectGoalSchema } from "@/lib/validations/project";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Leaf, UploadCloud } from "lucide-react";

export default function CreateProjectPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // File states
    const [pitchDoc, setPitchDoc] = useState<File | null>(null);
    const [images, setImages] = useState<FileList | null>(null);

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    const hasCategories = Array.isArray(categories) && categories.length > 0;

    const mutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            toast.success("Project saved as DRAFT successfully!");
            queryClient.invalidateQueries({ queryKey: ["myProjects"] });
            router.push("/dashboard");
        },
        onError: (error: unknown) => {
            const errorMessage = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to create project.";
            toast.error(errorMessage || "Failed to create project.");
        },
    });

    const form = useForm({
        defaultValues: {
            title: "",
            description: "",
            goalAmount: 0,
            categoryId: "",
        },
        onSubmit: async ({ value }) => {
            // 1. Validate Text Data
            const validation = createProjectSchema.safeParse(value);
            if (!validation.success) {
                toast.error(validation.error.issues[0]?.message || "Please fix the form errors before submitting.");
                return;
            }

            // 2. Validate Files
            if (!pitchDoc) {
                toast.error("Please upload a PDF Pitch Document.");
                return;
            }

            // 3. Construct the FormData payload matching our backend requirement
            const formData = new FormData();

            // The backend expects the JSON stringified inside the 'data' field
            formData.append("data", JSON.stringify({
                title: value.title,
                description: value.description,
                goalAmount: value.goalAmount,
                categories: value.categoryId ? [value.categoryId] : [],
                status: "DRAFT" // Save as draft initially
            }));

            // Append the actual files
            formData.append("pitchDoc", pitchDoc);

            if (images) {
                // Append multiple images under the same key
                Array.from(images).forEach((file) => {
                    formData.append("images", file);
                });
            }

            // 4. Fire the mutation
            mutation.mutate(formData);
        },
    });
    // Alias form so we can use `Form.Field` in JSX without parsing issues
    const Form = form;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create a Project</h1>
                <p className="text-muted-foreground">
                    Draft your thesis project. It will be saved as a draft until you submit it for Admin review.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-primary" />
                        Project Details
                    </CardTitle>
                    <CardDescription>Provide a clear, compelling overview of your sustainable idea.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                        className="space-y-6"
                    >
                        {/* TITLE */}
                        <Form.Field
                            name="title"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = projectTitleSchema.safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Project Title</Label>
                                    <Input
                                        id={field.name}
                                        placeholder="e.g., AI-Driven Solar Panel Optimization"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        disabled={mutation.isPending}
                                    />
                                    {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                                </div>
                            )}
                        </Form.Field>

                        {/* CATEGORY & GOAL ROW */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Field name="categoryId">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor={field.name}>Primary Category</Label>
                                        <Select
                                            disabled={isLoadingCategories || mutation.isPending}
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories?.map((cat: { id: string; name: string }) => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {!isLoadingCategories && !hasCategories && (
                                            <p className="text-sm text-muted-foreground">
                                                No categories available right now. You can still save as draft.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </Form.Field>

                            <Form.Field
                                name="goalAmount"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = projectGoalSchema.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0].message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor={field.name}>Funding Goal ($)</Label>
                                        <Input
                                            id={field.name}
                                            type="number"
                                            placeholder="5000"
                                            value={field.state.value || ""}
                                            onChange={(e) => {
                                                const nextValue = e.target.value;
                                                field.handleChange(nextValue === "" ? 0 : Number(nextValue));
                                            }}
                                            onBlur={field.handleBlur}
                                            disabled={mutation.isPending}
                                        />
                                        {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                                    </div>
                                )}
                            </Form.Field>
                        </div>

                        {/* DESCRIPTION */}
                        <Form.Field
                            name="description"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = projectDescriptionSchema.safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Detailed Description</Label>
                                    <Textarea
                                        id={field.name}
                                        placeholder="Explain the problem, your proposed solution, and how the funds will be used..."
                                        className="min-h-40"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        disabled={mutation.isPending}
                                    />
                                    {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                                </div>
                            )}
                        </Form.Field>

                        {/* FILE UPLOADS (NATIVE REACT STATE) */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <UploadCloud className="h-5 w-5 text-muted-foreground" /> Media & Documents
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="pitchDoc">Pitch Document (PDF ONLY) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="pitchDoc"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setPitchDoc(e.target.files?.[0] || null)}
                                    disabled={mutation.isPending}
                                    className="cursor-pointer file:text-primary file:font-semibold file:bg-primary/10 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="images">Prototype Images (PNG, JPG) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                <Input
                                    id="images"
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    multiple
                                    onChange={(e) => setImages(e.target.files)}
                                    disabled={mutation.isPending}
                                    className="cursor-pointer file:text-primary file:font-semibold file:bg-primary/10 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? "Uploading to Cloudinary..." : "Save as Draft"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}