"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { deleteProject, getMyProjects, submitProjectForReview, updateProject } from "@/services/project.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Send, Clock, CheckCircle, Plus, LayoutList, Trash2, Edit3 } from "lucide-react";

type MyProject = {
    id: string;
    title: string;
    description: string;
    status: string;
    pitchDocUrl?: string | null;
    images?: string[];
    adminFeedback?: string | null;
    raisedAmount: number;
    goalAmount: number;
    createdAt: string;
};

type EditingProject = {
    id: string;
    title: string;
    description: string;
    goalAmount: number;
    pitchDoc: File | null;
    images: FileList | null;
};

type MyProjectTab = "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "FUNDED" | "COMPLETED";

const projectTabs: Array<{ value: MyProjectTab; label: string }> = [
    { value: "ALL", label: "All" },
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING", label: "In Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "FUNDED", label: "Funded" },
    { value: "COMPLETED", label: "Completed" },
];

// Helper function to color-code project statuses
const getStatusBadge = (status: string) => {
    switch (status) {
        case "DRAFT": return <Badge variant="outline" className="text-neutral-500"><FileText className="mr-1 h-3 w-3" /> Draft</Badge>;
        case "PENDING": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> In Review</Badge>;
        case "APPROVED": return <Badge variant="default" className="bg-primary text-primary-foreground"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
        case "FUNDED": return <Badge variant="default" className="bg-blue-600"><CheckCircle className="mr-1 h-3 w-3" /> Funded</Badge>;
        case "COMPLETED": return <Badge variant="default" className="bg-purple-600"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

const hasRequiredReviewAssets = (project: MyProject) => {
    return Boolean(project.pitchDocUrl && (project.images?.length ?? 0) > 0);
};

export default function MyProjectsPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<MyProjectTab>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<EditingProject | null>(null);
    const PAGE_SIZE = 6;

    const { data: projects, isLoading } = useQuery({
        queryKey: ["myProjects"],
        queryFn: getMyProjects,
        enabled: !!session,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const submitMutation = useMutation({
        mutationFn: submitProjectForReview,
        onMutate: () => {
            toast.loading("Your proposal is being submitted to admin for review...", {
                id: "submit-project-review",
            });
        },
        onSuccess: () => {
            toast.dismiss("submit-project-review");
            toast.success("Project submitted to Admins for review!");
            queryClient.invalidateQueries({ queryKey: ["myProjects"] });
        },
        onError: (error: unknown) => {
            toast.dismiss("submit-project-review");
            const errorMessage = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to submit project.";
            toast.error(errorMessage || "Failed to submit project.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            toast.success("Project deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["myProjects"] });
        },
        onError: (error: unknown) => {
            const errorMessage = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to delete project.";
            toast.error(errorMessage || "Failed to delete project.");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: {
            id: string;
            payload: { title: string; description: string; goalAmount: number };
            files?: { pitchDoc?: File | null; images?: FileList | null };
        }) =>
            updateProject(data.id, { ...data.payload, status: "DRAFT" }, data.files),
        onSuccess: () => {
            toast.success("Project updated successfully.");
            queryClient.invalidateQueries({ queryKey: ["myProjects"] });
            setIsEditOpen(false);
        },
        onError: (error: unknown) => {
            const errorMessage = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to update project.";
            toast.error(errorMessage || "Failed to update project.");
        },
    });

    const openEditModal = (project: MyProject) => {
        setEditingProject({
            id: project.id,
            title: project.title,
            description: project.description,
            goalAmount: project.goalAmount,
            pitchDoc: null,
            images: null,
        });
        setIsEditOpen(true);
    };

    if (!session) return null;

    const projectList = (projects ?? []) as MyProject[];
    const filteredProjects = activeTab === "ALL"
        ? projectList
        : projectList.filter((project) => project.status === activeTab);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));

    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredProjects.slice(start, start + PAGE_SIZE);
    }, [filteredProjects, currentPage]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                    <p className="text-muted-foreground">Manage your thesis drafts and track funding progress.</p>
                </div>
                <Link href="/dashboard/create-project">
                    <Button className="gap-2"><Plus className="h-4 w-4" /> New Project</Button>
                </Link>
            </div>

            <div className="flex flex-wrap gap-2">
                {projectTabs.map((tab) => (
                    <Button
                        key={tab.value}
                        size="sm"
                        variant={activeTab === tab.value ? "default" : "outline"}
                        onClick={() => setActiveTab(tab.value)}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/4" /></CardHeader>
                            <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                        </Card>
                    ))
                ) : filteredProjects.length > 0 ? (
                    paginatedProjects.map((project: MyProject) => (
                        <Card key={project.id} className="flex flex-col relative overflow-hidden">
                            {/* Optional Admin Feedback Alert */}
                            {project.adminFeedback && project.status === "DRAFT" && (
                                <div className="bg-red-50 border-b border-red-100 p-3 text-sm text-red-800">
                                    <strong>Admin Note:</strong> {project.adminFeedback}
                                </div>
                            )}

                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    {getStatusBadge(project.status)}
                                    <span className="text-sm font-medium text-primary">${project.raisedAmount} / ${project.goalAmount}</span>
                                </div>
                                <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 pb-2">
                                <div className="text-xs text-neutral-500">
                                    Created on {new Date(project.createdAt).toLocaleDateString()}
                                </div>
                            </CardContent>

                            <CardFooter className="border-t bg-neutral-50 p-4 flex flex-col gap-2">
                                {project.status === "DRAFT" ? (
                                    <>
                                        <Button
                                            className="w-full gap-2"
                                            onClick={() => {
                                                if (!hasRequiredReviewAssets(project)) {
                                                    toast.error("Attach a pitch PDF and at least one image before submitting for review.");
                                                    openEditModal(project);
                                                    return;
                                                }
                                                submitMutation.mutate(project.id);
                                            }}
                                            disabled={submitMutation.isPending || !hasRequiredReviewAssets(project)}
                                        >
                                            <Send className="h-4 w-4" /> Submit for Review
                                        </Button>

                                        {!hasRequiredReviewAssets(project) && (
                                            <p className="text-center text-xs font-medium text-amber-700">
                                                Add pitch PDF and project image(s) in Edit before submit.
                                            </p>
                                        )}

                                        <div className="flex w-full gap-2">
                                            <Button variant="outline" className="w-1/2 gap-2" onClick={() => openEditModal(project)}>
                                                <Edit3 className="h-4 w-4" /> Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="w-1/2 gap-2"
                                                onClick={() => {
                                                    if (confirm("Permanently delete this draft?")) {
                                                        deleteMutation.mutate(project.id);
                                                    }
                                                }}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <Link href={`/projects/${project.id}`} className="w-full">
                                        <Button className="w-full">View Details</Button>
                                    </Link>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center border-2 border-dashed rounded-xl bg-white">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <LayoutList className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900">No projects in this status</h3>
                        <p className="text-neutral-500 mb-6">Try another tab or create a new project.</p>
                        <Link href="/dashboard/create-project">
                            <Button>Start your first project</Button>
                        </Link>
                    </div>
                )}
            </div>

            {!isLoading && filteredProjects.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                    <p className="text-sm text-neutral-500">Page {currentPage} of {totalPages}</p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Project Draft</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Title</label>
                            <Input
                                value={editingProject?.title || ""}
                                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Funding Goal ($)</label>
                            <Input
                                type="number"
                                value={editingProject?.goalAmount || 0}
                                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, goalAmount: Number(e.target.value) } : prev)}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={editingProject?.description || ""}
                                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                                className="min-h-[180px] w-full resize-y whitespace-pre-wrap break-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Pitch PDF (required before submit for review)</label>
                            <Input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, pitchDoc: e.target.files?.[0] ?? null } : prev)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Images (required before submit for review)</label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setEditingProject((prev) => prev ? { ...prev, images: e.target.files } : prev)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                if (!editingProject) return;
                                updateMutation.mutate({
                                    id: editingProject.id,
                                    payload: {
                                        title: editingProject.title,
                                        description: editingProject.description,
                                        goalAmount: editingProject.goalAmount,
                                    },
                                    files: {
                                        pitchDoc: editingProject.pitchDoc,
                                        images: editingProject.images,
                                    },
                                });
                            }}
                            disabled={updateMutation.isPending || !editingProject?.title || !editingProject?.description || editingProject.goalAmount <= 0}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}