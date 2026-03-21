"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { MessageSquareQuote, Star } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { createReview, getUserReviews } from "@/services/review.service";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ReviewItem = {
    id: string;
    projectId: string;
    rating: number;
    comment?: string;
    reviewer?: { name?: string };
};

type UserReviewsResponse = {
    averageRating: number;
    totalReviews: number;
    reviews: ReviewItem[];
};

interface ProjectReviewsProps {
    projectId: string;
    studentId: string;
    projectStatus: string;
}

export default function ProjectReviews({ projectId, studentId, projectStatus }: ProjectReviewsProps) {
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;
    const queryClient = useQueryClient();

    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const { data: reviewsData, isLoading } = useQuery<UserReviewsResponse>({
        queryKey: ["reviews", studentId],
        queryFn: () => getUserReviews(studentId),
        enabled: Boolean(studentId),
    });

    const mutation = useMutation({
        mutationFn: createReview,
        onSuccess: () => {
            toast.success("Review submitted successfully!");
            queryClient.invalidateQueries({ queryKey: ["reviews", studentId] });
            setIsReviewOpen(false);
            setRating(5);
            setComment("");
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to submit review. You may have already reviewed this project.";
            toast.error(message || "Failed to submit review. You may have already reviewed this project.");
        },
    });

    const handleSubmit = () => {
        if (comment.trim().length < 10) {
            toast.error("Please provide a slightly more detailed comment (min 10 chars).");
            return;
        }

        mutation.mutate({
            projectId,
            revieweeId: studentId,
            rating,
            comment: comment.trim(),
        });
    };

    const projectReviews = (reviewsData?.reviews || []).filter((review) => review.projectId === projectId);

    return (
        <Card className="mt-8 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquareQuote className="h-5 w-5 text-amber-500" /> Sponsor Reviews
                </CardTitle>

                {currentUser?.role === "SPONSOR" && projectStatus === "COMPLETED" && (
                    <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(true)} className="gap-2">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> Leave a Review
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-neutral-500">Loading reviews...</div>
                    ) : projectReviews.length > 0 ? (
                        projectReviews.map((review) => (
                            <div key={review.id} className="rounded-xl border bg-neutral-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px]">
                                                {review.reviewer?.name?.charAt(0) || "S"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-semibold">{review.reviewer?.name || "Anonymous Sponsor"}</span>
                                    </div>
                                    <div className="flex text-amber-400">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={index}
                                                className={`h-4 w-4 ${index < review.rating ? "fill-amber-400" : "text-neutral-300"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap wrap-break-word text-sm italic text-neutral-600">
                                    &ldquo;{review.comment || "No written feedback provided."}&rdquo;
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center text-neutral-500">
                            {projectStatus === "COMPLETED"
                                ? "No reviews yet. Be the first to share your thoughts!"
                                : "Reviews will unlock once the student marks this project as Completed."}
                        </div>
                    )}
                </div>
            </CardContent>

            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rate this Project</DialogTitle>
                        <DialogDescription>
                            Share your experience backing this research to help build the student&apos;s reputation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                            <label className="text-sm font-medium">Rating (1-5 Stars)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-8 w-8 cursor-pointer transition-colors ${star <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your Feedback</label>
                            <Textarea
                                placeholder="How was the communication? Was the prototype successful?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={mutation.isPending}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={mutation.isPending}>
                            {mutation.isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
