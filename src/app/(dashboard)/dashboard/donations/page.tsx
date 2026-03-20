"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getMyDonations } from "@/services/donation.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Receipt, ArrowRight, ExternalLink, Calendar, DollarSign, ShieldAlert } from "lucide-react";

export default function SponsorDonationsPage() {
    const { data: session } = useSession();

    const { data: donations, isLoading } = useQuery({
        queryKey: ["myDonations"],
        queryFn: getMyDonations,
        enabled: session?.user?.role === "SPONSOR",
    });

    if (session?.user?.role === "STUDENT") {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldAlert className="h-16 w-16 text-neutral-300 mb-4" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-neutral-500">This dashboard is for Sponsors only. Please view "My Projects" instead.</p>
            </div>
        );
    }

    const totalFunded = donations?.reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Donations</h1>
                <p className="text-muted-foreground">Track your contributions and the impact you are making on academic research.</p>
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
                        <p className="text-sm text-primary-foreground/80">Across {donations?.length || 0} supported projects</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" /> Transaction History
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
                        ) : donations && donations.length > 0 ? (
                            donations.map((donation: any) => (
                                <div key={donation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-neutral-50 transition-colors gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={`/projects/${donation.projectId}`} className="font-semibold text-lg text-neutral-900 hover:text-primary hover:underline line-clamp-1">
                                                {donation.project?.title || "Project Name Unavailable"}
                                            </Link>
                                            {donation.project?.status === "COMPLETED" && (
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-[10px]">Completed</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-neutral-500 gap-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(donation.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-400 truncate max-w-[120px]">
                                                Tx: {donation.transactionId || donation.id.split('-')[0]}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48">
                                        <div className="text-xl font-bold text-emerald-600">+${donation.amount.toLocaleString()}</div>
                                        <Link href={`/projects/${donation.projectId}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary">
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
                </CardContent>
            </Card>
        </div>
    );
}
