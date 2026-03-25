"use client";

import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAllResourcesPaginated } from "@/services/resource.service";
import { Box, Cpu, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";

type ResourceItem = {
    id: string;
    name: string;
    description: string;
    type: "HARDWARE" | "SOFTWARE";
    totalCapacity?: number;
    availableCapacity?: number;
};

export default function PublicResourceHubPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 9;
    const { data: session } = useSession();
    const userRole = ((session?.user as { role?: string } | undefined)?.role ?? "").toUpperCase();
    const canClaimResources = userRole === "STUDENT";

    const { data: resourceResult, isLoading } = useQuery({
        queryKey: ["public-resources", currentPage],
        queryFn: () => getAllResourcesPaginated({ page: currentPage, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" }),
    });

    const resources = (resourceResult?.data ?? []) as ResourceItem[];
    const totalPages = Number(resourceResult?.meta?.totalPage || 1);

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />

            <section className="border-b bg-white py-14">
                <div className="container mx-auto max-w-5xl px-4 text-center">
                    <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-neutral-900">
                        Public <span className="text-primary">Resource Hub</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-neutral-600">
                        Browse available tools, hardware, and software resources shared by sponsors. Anyone can view this list, while claiming resources requires login.
                    </p>
                </div>
            </section>

            <main className="container mx-auto flex-1 px-4 py-10">
                {isLoading ? (
                    <p className="text-center text-neutral-500">Loading resources...</p>
                ) : resources.length === 0 ? (
                    <div className="rounded-xl border bg-white p-8 text-center text-neutral-600">
                        No resources have been listed yet.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {resources.map((resource) => (
                            <Card key={resource.id} className="border-0 shadow-md">
                                <CardContent className="space-y-3 p-6">
                                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                        {resource.type === "SOFTWARE" ? <Cpu className="h-4 w-4" /> : <Box className="h-4 w-4" />}
                                        {resource.type}
                                    </div>
                                    <h2 className="text-lg font-bold text-neutral-900">{resource.name}</h2>
                                    <p className="line-clamp-3 text-sm text-neutral-600">{resource.description}</p>
                                    <p className="text-xs text-neutral-500">
                                        Capacity: {resource.availableCapacity ?? resource.totalCapacity ?? 0} / {resource.totalCapacity ?? 0}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && resources.length > 0 && (
                    <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
                        <p className="text-sm text-neutral-500">Page {currentPage} of {Math.max(1, totalPages)}</p>
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

                <div className="mt-10 text-center">
                    {!session?.user && (
                        <Link href="/login">
                            <Button className="gap-2">Log in to claim resources <ArrowRight className="h-4 w-4" /></Button>
                        </Link>
                    )}

                    {session?.user && canClaimResources && (
                        <Link href="/dashboard/resources">
                            <Button className="gap-2">Go to claimable resources <ArrowRight className="h-4 w-4" /></Button>
                        </Link>
                    )}

                    {session?.user && !canClaimResources && (
                        <p className="text-sm font-medium text-amber-700">
                            Only student accounts can claim resources.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
