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

import { getProjectById, getProjectPitchDocDownloadUrl } from "@/services/project.service";
import { createCheckoutSession } from "@/services/payment.service";
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
import { FileText, Leaf, GraduationCap, Calendar, Share2, Heart, ArrowLeft, MessageSquare } from "lucide-react";

type ProjectDetail = {
    id: string;
    title: string;
    description: string;
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

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;
    const isSponsor = currentUser?.role === "SPONSOR";
    const isAdmin = currentUser?.role === "ADMIN";
    const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState<number>(50);

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

    const { data: project, isLoading, isError } = useQuery<ProjectDetail>({
        queryKey: ["project", projectId],
        queryFn: () => getProjectById(projectId),
        enabled: !!projectId,
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
    const joinedDateLabel = project.student?.createdAt
        ? new Date(project.student.createdAt).toLocaleDateString()
        : "Not available";

    const handleDonateClick = () => {
        if (!session) {
            toast.error("Please log in to back this project.");
            return;
        }

        if (!isSponsor) {
            toast.error("Students and admins cannot fund projects. Please use a sponsor account.");
            return;
        }

        setIsDonateModalOpen(true);
    };

    const handleShare = async () => {
        try {
            const url = `${window.location.origin}/projects/${project.id}`;
            if (navigator.share) {
                await navigator.share({ title: project.title, text: project.description, url });
                toast.success('Shared successfully');
                return;
            }

            await navigator.clipboard.writeText(url);
            toast.success('Project link copied to clipboard');
        } catch (err) {
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
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md">
                            {project.images?.[0] ? (
                                <img src={project.images[0]} alt={project.title} className="h-full w-full object-cover opacity-90" />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center bg-emerald-900 text-emerald-100/50">
                                    <Leaf className="mb-4 h-24 w-24 opacity-50" />
                                    <p>No prototype images provided.</p>
                                </div>
                            )}
                            <div className="absolute left-4 top-4">
                                <Badge className="border-0 bg-white px-3 py-1 text-emerald-700 shadow-sm hover:bg-white/90">
                                    {project.categories?.[0]?.name || "Sustainability"}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                                {project.title}
                            </h1>
                            <p className="whitespace-pre-wrap text-lg leading-relaxed text-neutral-600">
                                {project.description}
                            </p>
                        </div>

                        <Separator />

                        {(project.pitchDocUrl || project.pitchDoc) && (
                            <div className="flex items-center justify-between rounded-xl border bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900">Thesis Pitch Document</h3>
                                        <p className="text-sm text-neutral-500">PDF Format • Full technical specifications</p>
                                    </div>
                                </div>
                                <Button variant="outline" asChild>
                                    <a
                                        href={getProjectPitchDocDownloadUrl(project.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Download PDF
                                    </a>
                                </Button>
                            </div>
                        )}
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
                                    <Button
                                        size="lg"
                                        className="h-14 w-full bg-primary text-base shadow-md hover:bg-emerald-700"
                                        disabled={project.status === "COMPLETED" || project.status === "FUNDED"}
                                        onClick={handleDonateClick}
                                    >
                                        <Heart className="mr-2 h-5 w-5" />
                                        {project.status === "COMPLETED" ? "Project Completed" : "Back this Idea"}
                                    </Button>
                                ) : (
                                    <p className="rounded-md border bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                                        Only sponsors can back this idea.
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-full bg-neutral-50 text-neutral-600" onClick={handleShare}>
                                        <Share2 className="mr-2 h-4 w-4" /> Share
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-base">About the Researcher</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-start gap-4 pt-4">
                                {(isSponsor || isAdmin) && project.studentId ? (
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
                                    {(isSponsor || isAdmin) && project.studentId ? (
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
                                </div>
                                {/* Message Researcher Button */}
                                {session?.user?.id !== project.studentId && project.studentId && (
                                    <div className="mt-4">
                                        <Link href={`/dashboard/messages?contact=${project.studentId}`} className="block w-full">
                                            <Button variant="outline" className="w-full gap-2">
                                                <MessageSquare className="h-4 w-4" /> Message {project.student?.name?.split(' ')[0] || "Researcher"}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
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
