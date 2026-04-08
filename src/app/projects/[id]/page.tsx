"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useSession } from "@/lib/auth-client";
import { User } from "@/types";

import { getExploreProjects, getProjectById, getProjectPitchDocDownloadUrl, markProjectAsCompleted } from "@/services/project.service";
import { createCheckoutSession } from "@/services/payment.service";
import { getMyDonations } from "@/services/donation.service";
import ProjectTimeline from "@/components/projects/ProjectTimeline";
import ProjectReviews from "@/components/projects/ProjectReviews";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, GraduationCap, Calendar, Share2, Heart, ArrowLeft, MessageSquare, Download, Link2, MapPin, Target, Wallet } from "lucide-react";

type ProjectDetail = {
    id: string;
    title: string;
    description: string;
    createdAt?: string;
    goalAmount: number;
    raisedAmount: number;
    pitchDocUrl?: string | null;
    pitchDoc?: string | null;
    images: string[];
    categories?: Array<{ id: string; name: string }>;
    studentId?: string;
    student?: {
        name?: string;
        email?: string;
        university?: string | null;
        createdAt?: string;
    };
    status?: "DRAFT" | "PENDING" | "APPROVED" | "FUNDED" | "COMPLETED";
};

type DonationSummary = {
    projectId: string;
};

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;
    const isSponsor = currentUser?.role === "SPONSOR";
    const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState<number>(50);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const checkoutMutation = useMutation({
        mutationFn: createCheckoutSession,
        onSuccess: (data) => {
            if (data?.url) {
                window.location.href = data.url;
            } else {
                toast.error("Failed to initialize payment gateway.");
            }
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Payment initialization failed.";
            toast.error(message || "Payment initialization failed.");
        },
    });

    const { data: myDonations = [] } = useQuery<DonationSummary[]>({
        queryKey: ["myDonations", currentUser?.id],
        queryFn: () => getMyDonations(currentUser?.id),
        enabled: isSponsor,
    });

    const { data: project, isLoading, isError } = useQuery<ProjectDetail>({
        queryKey: ["project", projectId],
        queryFn: () => getProjectById(projectId),
        enabled: !!projectId,
    });

    const { data: relatedData } = useQuery({
        queryKey: ["relatedProjects", projectId, project?.categories?.[0]?.id],
        queryFn: () => getExploreProjects({ status: "APPROVED", sortBy: "createdAt_desc", limit: 10 }),
        enabled: !!projectId,
    });

    const completeProjectMutation = useMutation({
        mutationFn: () => markProjectAsCompleted(projectId),
        onSuccess: () => {
            toast.success("Project marked as completed.");
            window.location.reload();
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to mark project as completed.";
            toast.error(message || "Failed to mark project as completed.");
        },
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-neutral-50">
                <PublicNavbar />
                <main className="container mx-auto space-y-8 px-4 py-8 animate-pulse md:px-8">
                    <Skeleton className="h-8 w-32" />
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <Skeleton className="h-100 w-full rounded-xl" />
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-75 w-full rounded-xl" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 text-center">
                <PublicNavbar />
                <div className="space-y-4 py-24">
                    <h1 className="text-2xl font-bold">Project Not Found</h1>
                    <p className="text-neutral-500">This project may have been removed or is currently under review.</p>
                    <Link href="/projects"><Button variant="outline">Back to Explore</Button></Link>
                </div>
            </div>
        );
    }

    const progressPercentage = project.goalAmount > 0
        ? Math.min(Math.round((project.raisedAmount / project.goalAmount) * 100), 100)
        : 0;

    const galleryImages = project.images?.length > 0
        ? project.images
        : [
            "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1580983546522-8706bd30fc18?q=80&w=2070&auto=format&fit=crop",
        ];

    const safeActiveImage = galleryImages[activeImageIndex] || galleryImages[0];
    const primaryCategoryId = project.categories?.[0]?.id;
    const relatedProjects = ((relatedData?.data as ProjectDetail[] | undefined) || [])
        .filter((item) => item.id !== project.id)
        .filter((item) => {
            if (!primaryCategoryId) return true;
            return item.categories?.some((cat) => cat.id === primaryCategoryId);
        })
        .slice(0, 3);

    const joinedDateLabel = project.student?.createdAt
        ? new Date(project.student.createdAt).toLocaleDateString()
        : "Not available";
    const hasInvestedInProject = isSponsor && myDonations.some((donation) => donation.projectId === project.id);

    const handleDonateClick = () => {
        if (!session) {
            toast.error("Please log in to back this project.");
            return;
        }

        if (!isSponsor) {
            toast.error("Students and admins cannot fund projects. Please use a sponsor account.");
            return;
        }

        if (project.status === "FUNDED") {
            toast.info("This project is already fully funded.");
            return;
        }

        if (project.status === "COMPLETED") {
            toast.info("This project has already been marked as completed.");
            return;
        }

        setIsDonateModalOpen(true);
    };

    const handleShare = async () => {
        try {
            const url = `${window.location.origin}/projects/${project.id}`;
            if (navigator.share) {
                await navigator.share({ title: project.title, text: project.description, url });
                return;
            }

            await navigator.clipboard.writeText(url);
        } catch {
            toast.error('Unable to share this project');
        }
    };

    const proceedToCheckout = () => {
        if (donationAmount < 5) {
            toast.error("Minimum donation amount is $5.");
            return;
        }

        checkoutMutation.mutate({ projectId, amount: donationAmount });
    };

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />

            <main className="container mx-auto flex-1 px-4 py-8 md:px-8">
                <Link href="/projects" className="mb-6 inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to all ideas
                </Link>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <div>
                            <div className="mb-4 flex items-center gap-3">
                                <Badge className="border-0 bg-white px-3 py-1 text-emerald-700 shadow-sm hover:bg-white/90">
                                    {project.categories?.[0]?.name || "Sustainability"}
                                </Badge>
                                <Badge variant="secondary">{project.status || "DRAFT"}</Badge>
                            </div>

                            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                                {project.title}
                            </h1>

                            <p className="mb-6 flex items-center gap-2 text-muted-foreground">
                                <GraduationCap className="h-5 w-5" /> By {project.student?.name || "Anonymous Scholar"}
                            </p>

                            <div className="space-y-4">
                                <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-muted shadow-md">
                                    <img src={safeActiveImage} alt={project.title} className="h-full w-full object-cover transition-all duration-500 hover:scale-105" />
                                </div>

                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {galleryImages.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`h-24 w-32 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activeImageIndex === index
                                                ? "border-primary shadow-md"
                                                : "border-transparent opacity-65 hover:opacity-100"}`}
                                            aria-label={`Select project image ${index + 1}`}
                                        >
                                            <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <section>
                            <h3 className="mb-4 border-b pb-2 text-2xl font-bold">Project Overview</h3>
                            <p className="whitespace-pre-wrap wrap-break-word text-lg leading-relaxed text-neutral-600">
                                {project.description}
                            </p>
                        </section>

                        <Separator />

                        {(project.pitchDocUrl || project.pitchDoc) && (
                            <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900">Project Pitch Document</h3>
                                        <p className="text-sm text-neutral-500">PDF Format • Full technical specifications</p>
                                    </div>
                                </div>
                                <Button className="h-10 w-full gap-2 px-4 sm:w-auto" asChild>
                                    <a
                                        href={getProjectPitchDocDownloadUrl(project.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </a>
                                </Button>
                            </div>
                        )}

                        <section>
                            <h3 className="mb-4 border-b pb-2 text-2xl font-bold">Project Timeline</h3>
                            <ProjectTimeline projectId={project.id} studentId={project.studentId || ""} />
                        </section>

                        <section>
                            <h3 className="mb-4 border-b pb-2 text-2xl font-bold">Reviews</h3>
                            <ProjectReviews projectId={project.id} studentId={project.studentId || ""} projectStatus={project.status || "DRAFT"} />
                        </section>
                    </div>

                    <div className="space-y-6 lg:sticky lg:top-24">
                        <Card className="border-0 shadow-xl ring-1 ring-neutral-200">
                            <CardContent className="space-y-6 p-6">
                                <div>
                                    <div className="mb-2 flex items-end gap-2">
                                        <span className="text-4xl font-extrabold text-primary">${project.raisedAmount.toLocaleString()}</span>
                                        <span className="pb-1 font-medium text-neutral-500">raised of ${project.goalAmount.toLocaleString()} goal</span>
                                    </div>
                                    <Progress value={progressPercentage} className="mb-2 h-2 bg-neutral-100" />
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-primary">{progressPercentage}% funded</span>
                                        <span className="text-neutral-500">
                                            {project.status === "COMPLETED" ? "Funding Closed" : "Accepting Donations"}
                                        </span>
                                    </div>
                                </div>

                                {isSponsor ? (
                                    <div className="space-y-2">
                                        <Button
                                            size="lg"
                                            className="h-14 w-full bg-primary text-base shadow-md hover:bg-emerald-700"
                                            disabled={checkoutMutation.isPending}
                                            onClick={handleDonateClick}
                                        >
                                            <Heart className="mr-2 h-5 w-5" />
                                            {project.status === "COMPLETED"
                                                ? "Project Completed"
                                                : project.status === "FUNDED"
                                                    ? "Funding Closed"
                                                    : "Back this Idea"}
                                        </Button>

                                        {hasInvestedInProject && project.status !== "COMPLETED" && (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                disabled={completeProjectMutation.isPending}
                                                onClick={() => completeProjectMutation.mutate()}
                                            >
                                                {completeProjectMutation.isPending ? "Marking..." : "Mark as Completed"}
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="rounded-md border bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                                        Only sponsors can back this idea.
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-full border-primary/25 bg-primary/5 text-primary hover:bg-primary/10" onClick={handleShare}>
                                        <Share2 className="mr-2 h-4 w-4" /> Share Project
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-base">Key Specifications</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ul className="divide-y text-sm">
                                    <li className="flex justify-between p-4">
                                        <span className="flex items-center gap-2 text-muted-foreground"><Target className="h-4 w-4" /> Status</span>
                                        <Badge variant="secondary">{project.status || "DRAFT"}</Badge>
                                    </li>
                                    <li className="flex justify-between p-4">
                                        <span className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /> Min Donation</span>
                                        <span className="font-medium">$5.00</span>
                                    </li>
                                    <li className="flex justify-between p-4">
                                        <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Created</span>
                                        <span className="font-medium">{new Date(project.createdAt as string).toLocaleDateString()}</span>
                                    </li>
                                    <li className="flex justify-between p-4">
                                        <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> University</span>
                                        <span className="max-w-44 truncate font-medium" title={project.student?.university || "N/A"}>{project.student?.university || "N/A"}</span>
                                    </li>
                                    <li className="flex justify-between p-4">
                                        <span className="flex items-center gap-2 text-muted-foreground"><Link2 className="h-4 w-4" /> Pitch Deck</span>
                                        {(project.pitchDocUrl || project.pitchDoc) ? (
                                            <a href={getProjectPitchDocDownloadUrl(project.id)} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">View</a>
                                        ) : (
                                            <span className="font-medium text-muted-foreground">Unavailable</span>
                                        )}
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-base">About the Researcher</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-start gap-4 pt-4">
                                {project.studentId ? (
                                    <Link href={`/users/${project.studentId}`} className="block">
                                        <Avatar className="h-12 w-12 border">
                                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                                {project.student?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                ) : (
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                            {project.student?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div className="space-y-1">
                                    {project.studentId ? (
                                        <Link href={`/users/${project.studentId}`} className="font-semibold text-neutral-900 hover:text-primary hover:underline">
                                            {project.student?.name || "Anonymous Scholar"}
                                        </Link>
                                    ) : (
                                        <h4 className="font-semibold text-neutral-900">{project.student?.name || "Anonymous Scholar"}</h4>
                                    )}
                                    <div className="flex items-center gap-1 text-sm text-neutral-500">
                                        <GraduationCap className="h-4 w-4" />
                                        <span>{project.student?.university || "Independent Researcher"}</span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>Joined {joinedDateLabel}</span>
                                    </div>
                                    {session?.user?.id !== project.studentId && project.studentId && (
                                        <div className="pt-3">
                                            <Link href={`/dashboard/messages?contact=${project.studentId}`} className="block w-full">
                                                <Button className="h-10 w-full justify-center gap-2">
                                                    <MessageSquare className="h-4 w-4" /> Message {project.student?.name?.split(' ')[0] || "Researcher"}
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {relatedProjects.length > 0 && (
                    <section className="mt-20 border-t pt-10">
                        <h3 className="mb-8 text-2xl font-bold">More from {project.categories?.[0]?.name || "this category"}</h3>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedProjects.map((item) => {
                                const relatedProgress = Math.min(
                                    100,
                                    Math.round(((item.raisedAmount || 0) / Math.max(item.goalAmount || 1, 1)) * 100)
                                );

                                return (
                                    <Link key={item.id} href={`/projects/${item.id}`}>
                                        <Card className="h-full cursor-pointer overflow-hidden bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                                            <div className="relative h-32 bg-muted">
                                                <Badge className="absolute right-2 top-2 bg-white/90 text-neutral-800">{item.status || "APPROVED"}</Badge>
                                            </div>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="line-clamp-1 text-lg">{item.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="mb-2 h-1.5 w-full rounded-full bg-secondary">
                                                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${relatedProgress}%` }} />
                                                </div>
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-emerald-600">${item.raisedAmount?.toLocaleString() || 0}</span>
                                                    <span className="text-muted-foreground">Goal: ${item.goalAmount?.toLocaleString() || 0}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            <Dialog open={isDonateModalOpen} onOpenChange={setIsDonateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Back this Project</DialogTitle>
                        <DialogDescription>
                            Your contribution helps bring {project?.student?.name || "this student"}&apos;s research to life.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="amount" className="text-sm font-medium">Donation Amount (USD)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-neutral-500">$</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="5"
                                    className="pl-8 text-lg font-bold"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                                    disabled={checkoutMutation.isPending}
                                />
                            </div>
                            <p className="text-xs text-neutral-500">Minimum $5.00</p>
                        </div>
                    </div>
                    <DialogFooter className="flex-row items-center sm:justify-between">
                        <Button variant="ghost" onClick={() => setIsDonateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={proceedToCheckout}
                            disabled={checkoutMutation.isPending || donationAmount < 5}
                            className="gap-2 bg-primary hover:bg-emerald-700"
                        >
                            {checkoutMutation.isPending
                                ? "Connecting to Stripe..."
                                : `Proceed with $${donationAmount}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
