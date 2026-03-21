"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { completeProject, getMyProjects, submitProjectForReview } from "@/services/project.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Send, Clock, CheckCircle, Plus, LayoutList, Pencil, CheckSquare } from "lucide-react";

type MyProject = {
    id: string;
    title: string;
    description: string;
    status: string;
    adminFeedback?: string | null;
    raisedAmount: number;
    goalAmount: number;
    createdAt: string;
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

export default function MyProjectsPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<MyProjectTab>("ALL");

    const { data: projects, isLoading } = useQuery({
        queryKey: ["myProjects"],
        queryFn: getMyProjects,
        enabled: !!session,
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

    const completeMutation = useMutation({
        mutationFn: completeProject,
        onSuccess: () => {
            toast.success("Project marked as COMPLETED! Sponsors can now leave reviews.");
            queryClient.invalidateQueries({ queryKey: ["myProjects"] });
        },
        onError: (error: unknown) => {
            const errorMessage = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to complete project.";
            toast.error(errorMessage || "Failed to complete project.");
        },
    });

    if (!session) return null;

    const projectList = (projects ?? []) as MyProject[];
    const filteredProjects = activeTab === "ALL"
        ? projectList
        : projectList.filter((project) => project.status === activeTab);

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
                    filteredProjects.map((project: MyProject) => (
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

                            <CardFooter className="border-t bg-neutral-50 p-4 flex gap-2">
                                {project.status === "DRAFT" ? (
                                    <div className="flex w-full gap-2">
                                        <Link href={`/dashboard/create-project?projectId=${project.id}`} className="w-1/2">
                                            <Button variant="outline" className="w-full gap-2 whitespace-nowrap">
                                                <Pencil className="h-4 w-4" /> Edit Draft
                                            </Button>
                                        </Link>
                                        <Button
                                            className="w-1/2 gap-2 whitespace-nowrap"
                                            onClick={() => submitMutation.mutate(project.id)}
                                            disabled={submitMutation.isPending}
                                        >
                                            <Send className="h-4 w-4" />
                                            {submitMutation.isPending ? "Submitting..." : "Submit for Review"}
                                        </Button>
                                    </div>
                                ) : project.status === "FUNDED" || project.status === "APPROVED" ? (
                                    <div className="flex w-full gap-2">
                                        <Link href={`/projects/${project.id}`} className="w-1/2">
                                            <Button variant="outline" className="w-full">View</Button>
                                        </Link>
                                        <Button
                                            className="w-1/2 bg-purple-600 hover:bg-purple-700 gap-2"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to mark this project as completed? This action cannot be undone.")) {
                                                    completeMutation.mutate(project.id);
                                                }
                                            }}
                                            disabled={completeMutation.isPending}
                                        >
                                            <CheckSquare className="h-4 w-4" /> Finish Idea
                                        </Button>
                                    </div>
                                ) : (
                                    <Link href={`/projects/${project.id}`} className="w-full">
                                        <Button variant="outline" className="w-full">View Public Page</Button>
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
        </div>
    );
}