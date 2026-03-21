"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Clock, Milestone, Plus } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { createMilestone, getProjectTimeline } from "@/services/timeline.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type TimelineEvent = {
    id: string;
    title: string;
    description: string;
    createdAt: string;
};

interface ProjectTimelineProps {
    projectId: string;
    studentId: string;
}

export default function ProjectTimeline({ projectId, studentId }: ProjectTimelineProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const { data: timeline = [], isLoading } = useQuery<TimelineEvent[]>({
        queryKey: ["timeline", projectId],
        queryFn: () => getProjectTimeline(projectId),
        enabled: Boolean(projectId),
    });

    const mutation = useMutation({
        mutationFn: createMilestone,
        onSuccess: () => {
            toast.success("Milestone posted successfully!");
            queryClient.invalidateQueries({ queryKey: ["timeline", projectId] });
            setIsAdding(false);
            setTitle("");
            setDescription("");
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to post milestone.";
            toast.error(message || "Failed to post milestone.");
        },
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            toast.error("Please provide both a title and a description.");
            return;
        }

        mutation.mutate({
            projectId,
            title: title.trim(),
            description: description.trim(),
        });
    };

    const isOwner = session?.user?.id === studentId;

    return (
        <Card className="mt-8 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="h-5 w-5 text-primary" /> Project Timeline
                </CardTitle>
                {isOwner && !isAdding && (
                    <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Update
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                {isAdding && (
                    <div className="mb-6 rounded-xl border bg-neutral-50 p-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="mb-3 font-semibold">Post a new milestone</h4>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <Input
                                placeholder="Milestone Title (e.g., Phase 1 Complete)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={mutation.isPending}
                            />
                            <Textarea
                                placeholder="Describe what was accomplished..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={mutation.isPending}
                                className="min-h-20"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAdding(false)}
                                    disabled={mutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Posting..." : "Post Update"}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-linear-to-b before:from-transparent before:via-neutral-200 before:to-transparent md:before:mx-auto md:before:translate-x-0">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    ) : timeline.length > 0 ? (
                        timeline.map((event) => (
                            <div
                                key={event.id}
                                className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
                            >
                                <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-primary text-primary-foreground shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <Milestone className="h-4 w-4" />
                                </div>
                                <div className="w-[calc(100%-4rem)] rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md md:w-[calc(50%-2.5rem)]">
                                    <div className="mb-1 flex items-center justify-between gap-2">
                                        <h4 className="font-bold text-neutral-900">{event.title}</h4>
                                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-500">
                                            {new Date(event.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-600">{event.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="relative z-10 bg-white py-8 text-center text-neutral-500">
                            No milestones have been posted yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
