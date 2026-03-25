"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { getAllDonations } from "@/services/admin.service";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, DollarSign, Receipt, ArrowUpRight } from "lucide-react";

type DonationTx = {
    id: string;
    amount: number;
    createdAt: string;
    userId?: string;
    projectId?: string;
    user?: { name?: string };
    project?: { title?: string };
};

type DonationsResponse = {
    data: DonationTx[];
    meta?: {
        page?: number;
        totalPage?: number;
        total?: number;
        limit?: number;
    };
};

export default function AdminDonationsPage() {
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 6;
    const currentUser = session?.user as unknown as User | undefined;
    const isAdmin = currentUser?.role === "ADMIN";

    const { data: donationsResponse, isLoading } = useQuery<DonationsResponse>({
        queryKey: ["allDonations", currentPage],
        queryFn: () => getAllDonations({ page: currentPage, limit: PAGE_SIZE }),
        enabled: isAdmin,
    });

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldAlert className="mb-4 h-16 w-16 text-neutral-300" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
            </div>
        );
    }

    const donations = donationsResponse?.data ?? [];
    const totalPages = Math.max(1, Number(donationsResponse?.meta?.totalPage ?? 1));

    const totalVolume = donations.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const averageDonation = donations.length ? (totalVolume / donations.length).toFixed(2) : "0.00";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    <Receipt className="h-8 w-8 text-primary" /> Global Ledger
                </h1>
                <p className="text-muted-foreground">Monitor all financial transactions and platform funding volume.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 bg-primary text-primary-foreground shadow-md md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium text-primary-foreground/80">Total Platform Volume</CardDescription>
                        <CardTitle className="flex items-center text-4xl font-extrabold">
                            <DollarSign className="mr-1 h-8 w-8 opacity-80" />
                            {totalVolume.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-primary-foreground/80">Across {donations.length} total transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium text-neutral-500">Average Donation</CardDescription>
                        <CardTitle className="text-3xl font-bold text-neutral-900">${averageDonation}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 md:hidden">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="rounded-lg border bg-white p-4">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="mt-2 h-4 w-36" />
                                    <Skeleton className="mt-2 h-4 w-full" />
                                    <Skeleton className="mt-3 h-5 w-24" />
                                </div>
                            ))
                        ) : donations.map((tx) => (
                            <div key={tx.id} className="rounded-lg border bg-white p-4">
                                <p className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                <p className="mt-1 text-sm text-neutral-900">Sponsor: {tx.user?.name || "Unknown"}</p>
                                <Link href={`/projects/${tx.projectId || ""}`} className="mt-1 line-clamp-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                    {tx.project?.title || "Unknown Project"} <ArrowUpRight className="h-3 w-3" />
                                </Link>
                                <p className="mt-2 text-base font-bold text-emerald-600">+${Number(tx.amount || 0).toLocaleString()}</p>
                            </div>
                        ))}

                        {!isLoading && donations.length === 0 && (
                            <div className="py-8 text-center text-neutral-500">No transactions recorded yet.</div>
                        )}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Sponsor</th>
                                    <th className="px-6 py-3">Project</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="ml-auto h-4 w-16" /></td>
                                        </tr>
                                    ))
                                ) : donations.map((tx) => (
                                    <tr key={tx.id} className="border-b bg-white hover:bg-neutral-50">
                                        <td className="px-6 py-4 text-neutral-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                            <Link href={`/users/${tx.userId || ""}`} className="hover:text-primary hover:underline">
                                                {tx.user?.name || "Unknown"}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/projects/${tx.projectId || ""}`} className="line-clamp-1 flex items-center gap-1 hover:text-primary hover:underline">
                                                {tx.project?.title || "Unknown Project"} <ArrowUpRight className="h-3 w-3" />
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">+${Number(tx.amount || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {donations.length === 0 && (
                            <div className="py-8 text-center text-neutral-500">No transactions recorded yet.</div>
                        )}

                        {!isLoading && donations.length > 0 && (
                            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                                <p className="text-sm text-neutral-500">Page {currentPage} of {totalPages}</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage <= 1}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage >= totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
