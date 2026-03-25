"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Package, Trash2, CheckCircle2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { getAllResources, getMyClaims, deleteResource, ResourceType } from "@/services/resource.service";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ResourceItem = {
    id: string;
    name: string;
    description: string;
    type: ResourceType;
    lenderId?: string;
    availableQuantity?: number;
    lender?: { name?: string; email?: string };
};

type ResourceClaim = {
    id: string;
    createdAt: string;
    resource?: {
        id: string;
        name: string;
        type: ResourceType;
        lender?: { name?: string };
    };
};

export default function MyItemsPage() {
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;
    const userRole = currentUser?.role;
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    const { data: resources = [], isLoading: loadingResources } = useQuery<ResourceItem[]>({
        queryKey: ["resources"],
        queryFn: getAllResources,
        enabled: userRole === "SPONSOR",
    });

    const { data: myClaims = [], isLoading: loadingClaims } = useQuery<ResourceClaim[]>({
        queryKey: ["myClaims", currentUser?.id],
        queryFn: getMyClaims,
        enabled: userRole === "STUDENT",
    });

    const deleteMutation = useMutation({
        mutationFn: deleteResource,
        onSuccess: () => {
            toast.success("Resource deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["resources"] });
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to delete resource.";
            toast.error(message || "Failed to delete resource.");
        },
    });

    const myListedResources = useMemo(() => {
        if (userRole !== "SPONSOR" || !currentUser) return [];

        return resources.filter((resource) => {
            if (resource.lenderId && resource.lenderId === currentUser.id) return true;
            return Boolean(resource.lender?.email && resource.lender.email === currentUser.email);
        });
    }, [resources, userRole, currentUser]);

    const studentTotalPages = Math.max(1, Math.ceil(myClaims.length / PAGE_SIZE));
    const sponsorTotalPages = Math.max(1, Math.ceil(myListedResources.length / PAGE_SIZE));
    const paginatedClaims = myClaims.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const paginatedListedResources = myListedResources.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    <Package className="h-8 w-8 text-primary" />
                    {userRole === "SPONSOR" ? "My Listed Items" : "My Claimed Items"}
                </h1>
                <p className="text-muted-foreground">
                    {userRole === "SPONSOR"
                        ? "Manage the resources you listed for students."
                        : "Track the resources you claimed for your work."}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userRole === "STUDENT" ? (
                    loadingClaims ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : myClaims.length > 0 ? (
                        paginatedClaims.map((claim) => (
                            <Card key={claim.id} className="border-emerald-200 bg-emerald-50/30">
                                <CardHeader>
                                    <CardTitle className="text-lg">{claim.resource?.name || "Unknown Resource"}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-neutral-600">
                                        Claimed on <strong>{new Date(claim.createdAt).toLocaleDateString()}</strong>
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-600">
                                        Provider: <strong>{claim.resource?.lender?.name || "Sponsor"}</strong>
                                    </p>
                                    <Badge className="mt-2 border-0 bg-emerald-100 text-emerald-800">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> In Use
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full rounded-xl border-2 border-dashed py-8 text-center text-neutral-500">
                            You have not claimed any resources yet.
                        </div>
                    )
                ) : userRole === "SPONSOR" ? (
                    loadingResources ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : myListedResources.length > 0 ? (
                        paginatedListedResources.map((resource) => (
                            <Card key={resource.id}>
                                <CardHeader>
                                    <CardTitle>{resource.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-neutral-600 line-clamp-3">{resource.description}</p>
                                    <p className="mt-2 text-xs text-neutral-500">Available: {resource.availableQuantity ?? 0}</p>
                                </CardContent>
                                <CardFooter className="border-t bg-neutral-50 p-4">
                                    <Button
                                        variant="destructive"
                                        className="w-full gap-2"
                                        onClick={() => deleteMutation.mutate(resource.id)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete Listing
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full rounded-xl border-2 border-dashed py-8 text-center text-neutral-500">
                            You have not listed any resources yet.
                        </div>
                    )
                ) : (
                    <div className="col-span-full rounded-xl border-2 border-dashed py-8 text-center text-neutral-500">
                        This page is available for students and sponsors.
                    </div>
                )}
            </div>

            {userRole === "STUDENT" && !loadingClaims && myClaims.length > PAGE_SIZE && (
                <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                    <p className="text-sm text-neutral-500">Page {currentPage} of {studentTotalPages}</p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => setCurrentPage((prev) => Math.min(studentTotalPages, prev + 1))}
                            disabled={currentPage >= studentTotalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {userRole === "SPONSOR" && !loadingResources && myListedResources.length > PAGE_SIZE && (
                <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                    <p className="text-sm text-neutral-500">Page {currentPage} of {sponsorTotalPages}</p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => setCurrentPage((prev) => Math.min(sponsorTotalPages, prev + 1))}
                            disabled={currentPage >= sponsorTotalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
