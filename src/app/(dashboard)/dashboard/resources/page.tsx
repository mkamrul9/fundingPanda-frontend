"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Package, Plus, Cpu, HardDrive, Trash2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { getAllResources, createResource, claimResource, deleteResource, ResourceType } from "@/services/resource.service";
import { getMyProjects } from "@/services/project.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type ResourceItem = {
    id: string;
    name: string;
    description: string;
    type: ResourceType;
    lenderId?: string;
    availableQuantity?: number;
    lender?: { name?: string; email?: string };
};

type StudentProject = {
    id: string;
    title: string;
    status?: string;
};

export default function ResourcesMarketplacePage() {
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;
    const userRole = currentUser?.role;
    const queryClient = useQueryClient();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isClaimOpen, setIsClaimOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

    const [newResource, setNewResource] = useState({ title: "", description: "", capacity: 1, type: "HARDWARE" as ResourceType });
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const { data: resources = [], isLoading: loadingResources } = useQuery<ResourceItem[]>({
        queryKey: ["resources"],
        queryFn: getAllResources,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const { data: myProjects = [] } = useQuery<StudentProject[]>({
        queryKey: ["myProjects", currentUser?.id],
        queryFn: getMyProjects,
        enabled: userRole === "STUDENT",
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const selectableProjects = myProjects.filter((project) => project.status !== "COMPLETED");

    const createMutation = useMutation({
        mutationFn: createResource,
        onSuccess: () => {
            toast.success("Resource listed successfully!");
            queryClient.invalidateQueries({ queryKey: ["resources"] });
            setIsCreateOpen(false);
            setNewResource({ title: "", description: "", capacity: 1, type: "HARDWARE" });
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to create resource.";
            toast.error(message || "Failed to create resource.");
        },
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

    const isMyResource = (resource: ResourceItem) => {
        if (!currentUser) return false;
        if (resource.lenderId && resource.lenderId === currentUser.id) return true;
        return Boolean(resource.lender?.email && resource.lender.email === currentUser.email);
    };

    const claimMutation = useMutation({
        mutationFn: () => {
            if (!selectedResource || !selectedProjectId) {
                return Promise.reject(new Error("Please select a project first."));
            }
            return claimResource(selectedResource.id, selectedProjectId);
        },
        onSuccess: () => {
            toast.success("Resource claimed successfully! Check your messages to coordinate hand-off.");
            queryClient.invalidateQueries({ queryKey: ["resources"] });
            setIsClaimOpen(false);
            setSelectedProjectId("");
            setSelectedResource(null);
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : error instanceof Error
                    ? error.message
                    : "Failed to claim resource.";
            toast.error(message || "Failed to claim resource.");
        },
    });

    const handleClaimClick = (resource: ResourceItem) => {
        if (selectableProjects.length === 0) {
            toast.error("You need at least one non-completed project before claiming a resource.");
            return;
        }

        setSelectedResource(resource);
        setSelectedProjectId("");
        setIsClaimOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                        <Package className="h-8 w-8 text-primary" /> Resource Hub
                    </h1>
                    <p className="text-muted-foreground">Donate or claim hardware, software licenses, and testing kits.</p>
                    {userRole === "SPONSOR" && (
                        <p className="mt-2 text-sm font-medium text-amber-700">Only student accounts can claim resources. Sponsors can list and manage their own items.</p>
                    )}
                    {userRole === "ADMIN" && (
                        <p className="mt-2 text-sm font-medium text-amber-700">Only student accounts can claim resources. Admins can review listings in read-only mode here.</p>
                    )}
                </div>
                {userRole === "SPONSOR" && (
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> List a Resource
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loadingResources ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : resources.length > 0 ? (
                    resources.map((resource) => {
                        const available = resource.availableQuantity ?? 0;
                        const isOut = available < 1;
                        const mine = isMyResource(resource);

                        return (
                            <Card key={resource.id} className="relative flex flex-col overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                            <HardDrive className="mr-1 h-3 w-3" /> {resource.type === "SOFTWARE" ? "Software" : "Hardware"}
                                        </Badge>
                                        <span className="text-sm font-bold text-neutral-500">{available} Available</span>
                                    </div>
                                    <CardTitle className="text-xl">{resource.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="whitespace-pre-wrap wrap-break-word text-sm text-neutral-600">{resource.description}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                                        <Cpu className="h-4 w-4" /> Donated by {resource.lender?.name || "a Sponsor"}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-neutral-50 p-4">
                                    {userRole === "STUDENT" ? (
                                        <Button className="w-full" disabled={isOut} onClick={() => handleClaimClick(resource)}>
                                            {isOut ? "Out of Stock" : "Claim for Project"}
                                        </Button>
                                    ) : userRole === "SPONSOR" ? (
                                        mine ? (
                                            <Button
                                                variant="destructive"
                                                className="w-full gap-2"
                                                onClick={() => deleteMutation.mutate(resource.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" /> Delete Listing
                                            </Button>
                                        ) : (
                                            <Button variant="outline" className="w-full" disabled>
                                                Listed by another Sponsor
                                            </Button>
                                        )
                                    ) : (
                                        <Button variant="outline" className="w-full" disabled>
                                            Admin view only
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })
                ) : (
                    <div className="col-span-full rounded-xl border-2 border-dashed bg-white py-16 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                        <h3 className="text-lg font-semibold text-neutral-900">No resources available</h3>
                        <p className="text-neutral-500">Check back later for donated hardware and software.</p>
                    </div>
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>List a Resource</DialogTitle>
                        <DialogDescription>Offer hardware or software licenses to help students build their prototypes.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Item Name</label>
                            <Input
                                placeholder="e.g., Raspberry Pi 4 Model B"
                                value={newResource.title}
                                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select
                                value={newResource.type}
                                onValueChange={(value: ResourceType) => {
                                    setNewResource((prev) => ({
                                        ...prev,
                                        type: value,
                                        capacity: value === "HARDWARE" ? 1 : prev.capacity,
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose resource type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HARDWARE">Hardware</SelectItem>
                                    <SelectItem value="SOFTWARE">Software</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity Available</label>
                            <Input
                                type="number"
                                min="1"
                                value={newResource.capacity}
                                onChange={(e) => {
                                    const next = Number.parseInt(e.target.value || "1", 10);
                                    setNewResource({ ...newResource, capacity: Number.isNaN(next) ? 1 : next });
                                }}
                                disabled={newResource.type === "HARDWARE"}
                            />
                            {newResource.type === "HARDWARE" && (
                                <p className="text-xs text-neutral-500">Hardware is currently limited to one item per listing by backend rules.</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Details about condition, specs, region, or hand-off process..."
                                value={newResource.description}
                                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => createMutation.mutate(newResource)}
                            disabled={createMutation.isPending || !newResource.title.trim() || !newResource.description.trim()}
                        >
                            {createMutation.isPending ? "Listing..." : "List Item"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Claim Resource</DialogTitle>
                        <DialogDescription>Which of your projects should receive this resource?</DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project..." />
                            </SelectTrigger>
                            <SelectContent>
                                {selectableProjects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClaimOpen(false)}>Cancel</Button>
                        <Button onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending || !selectedProjectId}>
                            {claimMutation.isPending ? "Claiming..." : "Confirm Claim"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
