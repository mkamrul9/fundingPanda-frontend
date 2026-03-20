"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import {
    createProject,
    getCategories,
    getMyProjectById,
    updateProject,
    type UpsertProjectPayload,
} from "@/services/project.service";
import { createProjectSchema, projectTitleSchema, projectDescriptionSchema, projectGoalSchema } from "@/lib/validations/project";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Leaf, UploadCloud } from "lucide-react";

type FormValues = {
    title: string;
    description: string;
    goalAmount: number;
    categoryId: string;
};

type MyProjectDetail = {
    id: string;
    title: string;
    description: string;
    goalAmount: number;
    status: string;
    pitchDocUrl?: string | null;
    images?: string[];
    categories?: Array<{ id: string; name: string }>;
};

export default function CreateProjectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const projectId = searchParams.get("projectId");
    const isEditMode = Boolean(projectId);

    const [pitchDoc, setPitchDoc] = useState<File | null>(null);
    const [images, setImages] = useState<FileList | null>(null);
    const [submitStatus, setSubmitStatus] = useState<"DRAFT" | "PENDING">("DRAFT");

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    const { data: editingProject, isLoading: isLoadingProject } = useQuery<MyProjectDetail>({
        queryKey: ["myProject", projectId],
        queryFn: () => getMyProjectById(projectId as string),
        enabled: isEditMode,
    });

    const hasCategories = Array.isArray(categories) && categories.length > 0;
    const hasExistingPitchDoc = Boolean(editingProject?.pitchDocUrl);
    const hasExistingImages = Boolean(editingProject?.images && editingProject.images.length > 0);
    const isDraftEditable = !isEditMode || editingProject?.status === "DRAFT";

    const mutation = useMutation({
        mutationFn: async ({ value, status }: { value: FormValues; status: "DRAFT" | "PENDING" }) => {
            const payload: UpsertProjectPayload = {
                title: value.title,
                description: value.description,
                goalAmount: value.goalAmount,
                categoryId: value.categoryId || undefined,
                status,
            };

            if (isEditMode && projectId) {
                return updateProject(projectId, payload, { pitchDoc, images });
            }

            return createProject(payload, { pitchDoc, images });
        },
        onMutate: (variables) => {
            if (variables.status === "PENDING") {
                toast.loading("Your proposal is being submitted to admin for review...", {
                    id: "create-project-submit",
                });
            }
        },
        onSuccess: (_data, variables) => {
            toast.dismiss("create-project-submit");
            toast.success(
                variables.status === "DRAFT"
                    ? "Project saved as draft successfully!"
                    : "Project submitted for review successfully!",
            );
            queryClient.invalidateQueries({ queryKey: ["myProjects"] });
            router.push("/dashboard/my-projects");
        },
        onError: (error: unknown) => {
            toast.dismiss("create-project-submit");
            const errorMessage = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to save project.";
            toast.error(errorMessage || "Failed to save project.");
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
            const validation = createProjectSchema.safeParse(value);
            if (!validation.success) {
                toast.error(validation.error.issues[0]?.message || "Please fix the form errors before submitting.");
                return;
            }

            if (!isDraftEditable) {
                toast.error("Only draft projects can be edited or submitted for review.");
                return;
            }

            const hasPitchDoc = Boolean(pitchDoc || hasExistingPitchDoc);
            const hasImages = Boolean((images && images.length > 0) || hasExistingImages);

            if (submitStatus === "PENDING" && !hasPitchDoc) {
                toast.error("Please upload a PDF pitch document before submitting for review.");
                return;
            }

            if (submitStatus === "PENDING" && !hasImages) {
                toast.error("Please upload at least one prototype image before submitting for review.");
                return;
            }

            mutation.mutate({ value, status: submitStatus });
        },
    });

    const Form = form;

    useEffect(() => {
        if (!editingProject) {
            return;
        }

        form.setFieldValue("title", editingProject.title ?? "");
        form.setFieldValue("description", editingProject.description ?? "");
        form.setFieldValue("goalAmount", Number(editingProject.goalAmount) || 0);
        form.setFieldValue("categoryId", editingProject.categories?.[0]?.id ?? "");
    }, [editingProject, form]);

    if (isEditMode && isLoadingProject) {
        return <div className="text-sm text-muted-foreground">Loading project...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{isEditMode ? "Edit Draft Project" : "Create a Project"}</h1>
                <p className="text-muted-foreground">
                    Save your thesis project as a draft or submit it directly for Admin review.
                </p>
                {isEditMode && !isDraftEditable && (
                    <p className="mt-2 text-sm text-destructive">
                        This project is no longer editable because it is already in review or beyond.
                    </p>
                )}
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
                            const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
                            const targetStatus = submitter?.value === "PENDING" ? "PENDING" : "DRAFT";
                            setSubmitStatus(targetStatus);
                            form.handleSubmit();
                        }}
                        className="space-y-6"
                    >
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
                                        disabled={mutation.isPending || !isDraftEditable}
                                    />
                                    {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                                </div>
                            )}
                        </Form.Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Field name="categoryId">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor={field.name}>Primary Category</Label>
                                        <Select
                                            disabled={isLoadingCategories || mutation.isPending || !isDraftEditable}
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
                                            disabled={mutation.isPending || !isDraftEditable}
                                        />
                                        {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                                    </div>
                                )}
                            </Form.Field>
                        </div>

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
                                        disabled={mutation.isPending || !isDraftEditable}
                                    />
                                    {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>}
                                </div>
                            )}
                        </Form.Field>

                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <UploadCloud className="h-5 w-5 text-muted-foreground" /> Media & Documents
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="pitchDoc">Pitch Document (PDF ONLY)</Label>
                                <Input
                                    id="pitchDoc"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setPitchDoc(e.target.files?.[0] || null)}
                                    disabled={mutation.isPending || !isDraftEditable}
                                    className="cursor-pointer file:text-primary file:font-semibold file:bg-primary/10 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md"
                                />
                                {hasExistingPitchDoc && !pitchDoc && (
                                    <p className="text-xs text-muted-foreground">A pitch PDF is already attached to this draft.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="images">Prototype Images (PNG, JPG)</Label>
                                <Input
                                    id="images"
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    multiple
                                    onChange={(e) => setImages(e.target.files)}
                                    disabled={mutation.isPending || !isDraftEditable}
                                    className="cursor-pointer file:text-primary file:font-semibold file:bg-primary/10 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md"
                                />
                                {hasExistingImages && (!images || images.length === 0) && (
                                    <p className="text-xs text-muted-foreground">Prototype images are already attached to this draft.</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Draft can be saved without files. Submitting for review requires a PDF and at least one image.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <Button
                                type="submit"
                                value="DRAFT"
                                variant="outline"
                                className="w-full"
                                disabled={mutation.isPending || !isDraftEditable}
                            >
                                {mutation.isPending && submitStatus === "DRAFT"
                                    ? "Saving draft..."
                                    : "Save as Draft"}
                            </Button>
                            <Button
                                type="submit"
                                value="PENDING"
                                className="w-full"
                                disabled={mutation.isPending || !isDraftEditable}
                            >
                                {mutation.isPending && submitStatus === "PENDING"
                                    ? "Submitting..."
                                    : "Submit for Review"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}