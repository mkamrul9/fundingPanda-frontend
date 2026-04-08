"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { getAllDonations } from "@/services/admin.service";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, DollarSign, Receipt, ArrowUpRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    const currentUser = session?.user as unknown as User | undefined;
    const isAdmin = currentUser?.role === "ADMIN";

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const { data: donationsResponse, isLoading } = useQuery<DonationsResponse>({
        queryKey: ["allDonations", "admin-ledger"],
        queryFn: () => getAllDonations({ page: 1, limit: 500 }),
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

    const processedData = useMemo(() => {
        const totalVolume = donations.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
        const averageDonation = donations.length ? (totalVolume / donations.length).toFixed(2) : "0.00";

        const projectTotals: Record<string, number> = {};
        for (const tx of donations) {
            const rawTitle = tx.project?.title || "Unknown Project";
            const title = rawTitle.length > 16 ? `${rawTitle.slice(0, 16)}...` : rawTitle;
            projectTotals[title] = (projectTotals[title] || 0) + Number(tx.amount || 0);
        }

        const chartData = Object.entries(projectTotals)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 12);

        const q = searchTerm.trim().toLowerCase();
        const filteredDonations = q
            ? donations.filter((tx) => {
                const sponsorName = tx.user?.name?.toLowerCase() || "";
                const projectTitle = tx.project?.title?.toLowerCase() || "";
                return sponsorName.includes(q) || projectTitle.includes(q);
            })
            : donations;

        return {
            totalVolume,
            averageDonation,
            chartData,
            filteredDonations,
        };
    }, [donations, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(processedData.filteredDonations.length / ITEMS_PER_PAGE));
    const clampedCurrentPage = Math.min(currentPage, totalPages);
    const currentTableData = processedData.filteredDonations.slice(
        (clampedCurrentPage - 1) * ITEMS_PER_PAGE,
        clampedCurrentPage * ITEMS_PER_PAGE
    );

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
                            {processedData.totalVolume.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-primary-foreground/80">Across {donations.length} total transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium text-muted-foreground">Average Donation</CardDescription>
                        <CardTitle className="text-3xl font-bold">${processedData.averageDonation}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Funding Distribution by Project</CardTitle>
                    <CardDescription>Live visualization of where capital is flowing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mt-4 h-[300px] w-full">
                        {isLoading ? (
                            <Skeleton className="h-full w-full rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={processedData.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                                        formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Total Raised"]}
                                    />
                                    <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>A complete ledger of all platform activity.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by sponsor or project..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
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
                        ) : currentTableData.map((tx) => (
                            <div key={tx.id} className="rounded-lg border bg-white p-4">
                                <p className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                <p className="mt-1 text-sm text-neutral-900">Sponsor: {tx.user?.name || "Unknown"}</p>
                                <Link href={`/projects/${tx.projectId || ""}`} className="mt-1 line-clamp-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                    {tx.project?.title || "Unknown Project"} <ArrowUpRight className="h-3 w-3" />
                                </Link>
                                <p className="mt-2 text-base font-bold text-emerald-600">+${Number(tx.amount || 0).toLocaleString()}</p>
                            </div>
                        ))}

                        {!isLoading && currentTableData.length === 0 && (
                            <div className="py-8 text-center text-neutral-500">No transactions match your search.</div>
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
                                ) : currentTableData.map((tx) => (
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
                        {currentTableData.length === 0 && !isLoading && (
                            <div className="py-8 text-center text-neutral-500">No transactions match your search.</div>
                        )}

                        {!isLoading && processedData.filteredDonations.length > 0 && (
                            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                                <p className="text-sm text-neutral-500">
                                    Showing {(clampedCurrentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(clampedCurrentPage * ITEMS_PER_PAGE, processedData.filteredDonations.length)} of {processedData.filteredDonations.length} entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={clampedCurrentPage <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={clampedCurrentPage >= totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
