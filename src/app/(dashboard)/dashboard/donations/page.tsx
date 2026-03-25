"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { getMyDonations } from "@/services/donation.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Receipt, ExternalLink, Calendar, DollarSign, ShieldAlert, Milestone } from "lucide-react";

type DonationRecord = {
    id: string;
    amount: number;
    createdAt: string;
    transactionId?: string;
    projectId: string;
    project?: {
        id: string;
        title: string;
        status?: string;
    };
};

type InvestedProjectSummary = {
    projectId: string;
    title: string;
    status: string;
    investedAmount: number;
    lastDonationAt: string;
};

export default function SponsorDonationsPage() {
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;
    const currentUser = session?.user as unknown as User | undefined;
    const userRole = currentUser?.role;

    const { data: donations = [], isLoading } = useQuery<DonationRecord[]>({
        queryKey: ["myDonations", currentUser?.id],
        queryFn: () => getMyDonations(currentUser?.id),
        enabled: userRole === "SPONSOR",
    });

    if (userRole === "STUDENT") {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldAlert className="h-16 w-16 text-neutral-300 mb-4" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-neutral-500">This dashboard is for Sponsors only. Please view "My Projects" instead.</p>
            </div>
        );
    }

    const totalFunded = donations.reduce((sum, tx) => sum + tx.amount, 0);

    const investedProjects = Array.from(
        donations.reduce((map, donation) => {
            const projectId = donation.projectId;
            const title = donation.project?.title || "Project Name Unavailable";
            const status = donation.project?.status || "UNKNOWN";
            const lastDonationAt = donation.createdAt;

            if (!map.has(projectId)) {
                map.set(projectId, {
                    projectId,
                    title,
                    status,
                    investedAmount: donation.amount,
                    lastDonationAt,
                });
                return map;
            }

            const existing = map.get(projectId) as InvestedProjectSummary;
            existing.investedAmount += donation.amount;
            if (new Date(lastDonationAt).getTime() > new Date(existing.lastDonationAt).getTime()) {
                existing.lastDonationAt = lastDonationAt;
            }

            map.set(projectId, existing);
            return map;
        }, new Map<string, InvestedProjectSummary>()).values()
    ).sort((a, b) => new Date(b.lastDonationAt).getTime() - new Date(a.lastDonationAt).getTime());

    const totalPages = Math.max(1, Math.ceil(investedProjects.length / PAGE_SIZE));
    const paginatedProjects = investedProjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Donated Projects</h1>
                <p className="text-muted-foreground">Only projects you invested in are shown here. Open any project to view timeline updates.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary text-primary-foreground border-0 shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary-foreground/80 font-medium">Total Impact</CardDescription>
                        <CardTitle className="text-4xl font-extrabold flex items-center">
                            <DollarSign className="h-8 w-8 mr-1 opacity-80" />
                            {totalFunded.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-primary-foreground/80">Across {investedProjects.length} funded projects</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" /> Invested Projects
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-24" /></div>
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            ))
                        ) : investedProjects.length > 0 ? (
                            paginatedProjects.map((project) => (
                                <div key={project.projectId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-neutral-50 transition-colors gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={`/projects/${project.projectId}`} className="font-semibold text-lg text-neutral-900 hover:text-primary hover:underline line-clamp-1">
                                                {project.title}
                                            </Link>
                                            {project.status === "COMPLETED" && (
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-[10px]">Completed</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-neutral-500 gap-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Last funded: {new Date(project.lastDonationAt).toLocaleDateString()}
                                            </span>
                                            <Badge variant="outline">{project.status}</Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-auto">
                                        <div className="text-xl font-bold text-emerald-600">${project.investedAmount.toLocaleString()}</div>
                                        <Link href={`/projects/${project.projectId}`}>
                                            <Button variant="outline" className="gap-2">
                                                <Milestone className="h-4 w-4" /> View Timeline
                                            </Button>
                                        </Link>
                                        <Link href={`/projects/${project.projectId}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary" title="Open project details">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center flex flex-col items-center justify-center bg-neutral-50 rounded-xl border-2 border-dashed">
                                <Receipt className="h-12 w-12 text-neutral-300 mb-3" />
                                <h3 className="text-lg font-medium text-neutral-900">No donations yet</h3>
                                <p className="text-neutral-500 mb-4 text-sm">You haven't funded any projects. Start exploring ideas to make an impact!</p>
                                <Link href="/projects">
                                    <Button variant="outline">Explore Projects</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {!isLoading && investedProjects.length > PAGE_SIZE && (
                        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
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
                </CardContent>
            </Card>
        </div>
    );
}
