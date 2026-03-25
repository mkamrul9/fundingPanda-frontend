"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, MessageSquare, HandCoins, BadgeCheck, FileWarning, Milestone, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getMyNotifications, markAllNotificationsRead, NotificationItem } from "@/services/notification.service";
import { toast } from "sonner";

const iconForType = (type: NotificationItem["type"]) => {
    if (type === "MESSAGE") return <MessageSquare className="h-4 w-4 text-blue-600" />;
    if (type === "DONATION") return <HandCoins className="h-4 w-4 text-emerald-600" />;
    if (type === "PROJECT_STATUS") return <BadgeCheck className="h-4 w-4 text-emerald-600" />;
    if (type === "PROJECT_FEEDBACK") return <FileWarning className="h-4 w-4 text-amber-600" />;
    if (type === "MILESTONE") return <Milestone className="h-4 w-4 text-violet-600" />;
    return <ClipboardList className="h-4 w-4 text-neutral-700" />;
};

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    const { data, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: getMyNotifications,
    });

    const markAllMutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: (result) => {
            toast.success(`Marked ${result.markedCount} notifications as read`);
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: () => {
            toast.error("Failed to mark notifications as read");
        },
    });

    const notifications = data?.notifications ?? [];
    const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));

    const paginatedNotifications = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return notifications.slice(start, start + PAGE_SIZE);
    }, [notifications, currentPage]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                        <Bell className="h-7 w-7 text-primary" /> Notifications
                    </h1>
                    <p className="text-muted-foreground">Recent platform activity for your account.</p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => markAllMutation.mutate()}
                    disabled={markAllMutation.isPending}
                >
                    <CheckCheck className="h-4 w-4" />
                    {markAllMutation.isPending ? "Marking..." : "Mark all alerts read"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Feed</CardTitle>
                    <CardDescription>
                        {data?.unreadCount ?? 0} unread alert{(data?.unreadCount ?? 0) === 1 ? "" : "s"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <p className="text-sm text-neutral-500">Loading notifications...</p>
                    ) : notifications.length > 0 ? (
                        paginatedNotifications.map((item) => (
                            <Link
                                href={item.link}
                                key={item.id}
                                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-neutral-50 ${item.isUnread ? "border-primary/40 bg-primary/5" : ""}`}
                            >
                                <div className="mt-0.5">{iconForType(item.type)}</div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{item.title}</p>
                                    <p className="line-clamp-2 text-sm text-neutral-600">{item.description}</p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-sm text-neutral-500">No notifications yet.</p>
                    )}

                    {!isLoading && notifications.length > PAGE_SIZE && (
                        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                            <p className="text-sm text-neutral-500">Page {currentPage} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage <= 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    size="sm"
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
