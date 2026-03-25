"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { getPendingProjects, moderateProject } from "@/services/admin.service";
import { getProjectPitchDocDownloadUrl } from "@/services/project.service";
import { User } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, XCircle, CheckCircle, FileText, Image as ImageIcon, Eye } from "lucide-react";
import Link from "next/link";

type PendingProject = {
    id: string;
    title: string;
    description: string;
    goalAmount: number;
    pitchDocUrl?: string | null;
    images: string[];
};

type ApiErrorResponse = {
    message?: string;
};

export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const user = session?.user as unknown as User | undefined;
    const isAdmin = user?.role === "ADMIN";

    // State for the Rejection Modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    // Fetch only PENDING projects
    const { data: pendingProjects, isLoading } = useQuery({
        queryKey: ["pendingProjects"],
        queryFn: getPendingProjects,
        // Extra security check: only fetch if the user is an Admin
        enabled: !!session && isAdmin,
    });

    const moderateMutation = useMutation({
        mutationFn: moderateProject,
        onSuccess: (_, variables) => {
            toast.success(`Project successfully ${variables.status.toLowerCase()}!`);
            queryClient.invalidateQueries({ queryKey: ["pendingProjects"] });
            setRejectModalOpen(false);
            setFeedback("");
            setSelectedProjectId(null);
        },
        onError: (error: unknown) => {
            const message = isAxiosError<ApiErrorResponse>(error)
                ? error.response?.data?.message
                : undefined;
            toast.error(message || "Failed to update project status.");
        },
    });

    const moderationList = (pendingProjects as PendingProject[] | undefined) ?? [];
    const totalPages = Math.max(1, Math.ceil(moderationList.length / PAGE_SIZE));
    const paginatedModerationList = moderationList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleApprove = (projectId: string) => {
        moderateMutation.mutate({ projectId, status: "APPROVED" });
    };

    const handleOpenReject = (projectId: string) => {
        setSelectedProjectId(projectId);
        setRejectModalOpen(true);
    };

    const submitRejection = () => {
        if (!feedback || feedback.length < 10) {
            toast.error("Please provide at least 10 characters of constructive feedback.");
            return;
        }
        if (selectedProjectId) {
            moderateMutation.mutate({
                projectId: selectedProjectId,
                status: "DRAFT",
                adminFeedback: feedback
            });
        }
    };

    // Prevent non-admins from viewing this page content
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldCheck className="h-16 w-16 text-neutral-300 mb-4" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-neutral-500">You must be a Super Admin to view the moderation queue.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary" /> Moderation Queue
                </h1>
                <p className="text-muted-foreground">Review pending thesis projects and ensure they meet platform quality standards.</p>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                    ))
                ) : moderationList.length > 0 ? (
                    paginatedModerationList.map((project) => (
                        <Card key={project.id} className="overflow-hidden shadow-sm">
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                            Needs Review
                                        </span>
                                        <span className="text-sm text-neutral-500">
                                            Goal: <span className="font-bold text-neutral-900">${project.goalAmount}</span>
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                    <p className="text-neutral-600 text-sm mb-4 whitespace-pre-wrap wrap-break-word">{project.description}</p>

                                    {/* File Links */}
                                    <div className="flex flex-wrap gap-4">
                                        <Link href={`/projects/${project.id}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                                            <Eye className="h-4 w-4" /> View Project
                                        </Link>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h4 className="text-sm font-medium text-neutral-700">Project Images and PDF</h4>
                                            {project.pitchDocUrl && (
                                                <a href={getProjectPitchDocDownloadUrl(project.id)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">
                                                    <FileText className="h-3.5 w-3.5" /> Download Pitch PDF
                                                </a>
                                            )}
                                        </div>
                                        {project.images?.length ? (
                                            <div className="flex flex-wrap gap-2">
                                                {project.images.map((imageUrl, index) => (
                                                    <a
                                                        key={`${project.id}-image-${index}`}
                                                        href={imageUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <ImageIcon className="h-3.5 w-3.5" /> Image {index + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-neutral-500">No images uploaded yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Panel */}
                                <div className="bg-neutral-50 p-6 md:w-64 border-t md:border-t-0 md:border-l flex flex-col justify-center gap-3">
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                                        onClick={() => handleApprove(project.id)}
                                        disabled={moderateMutation.isPending}
                                    >
                                        <CheckCircle className="h-4 w-4" /> Approve Project
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="w-full gap-2"
                                        onClick={() => handleOpenReject(project.id)}
                                        disabled={moderateMutation.isPending}
                                    >
                                        <XCircle className="h-4 w-4" /> Reject & Feedback
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-24 text-center border-2 border-dashed rounded-xl bg-white">
                        <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900">Inbox Zero!</h3>
                        <p className="text-neutral-500">There are no pending projects awaiting review right now.</p>
                    </div>
                )}
            </div>

            {!isLoading && moderationList.length > PAGE_SIZE && (
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

            {/* Rejection Feedback Dialog */}
            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Project</DialogTitle>
                        <DialogDescription>
                            Please provide constructive feedback so the student knows what to fix. This will be sent directly to their dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Admin Feedback (Required)</Label>
                            <Textarea
                                id="feedback"
                                placeholder="e.g., The goal amount is too high for the scope, or the PDF pitch is missing cost breakdowns..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="min-h-25"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={submitRejection} disabled={moderateMutation.isPending}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}