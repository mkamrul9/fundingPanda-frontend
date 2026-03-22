import { apiClient } from "@/lib/axios";

export type NotificationItem = {
    id: string;
    type:
        | "MESSAGE"
        | "DONATION"
        | "PROJECT_STATUS"
        | "PROJECT_FEEDBACK"
        | "MILESTONE"
        | "ADMIN_PROJECT_SUBMISSION";
    title: string;
    description: string;
    createdAt: string;
    link: string;
    isUnread: boolean;
};

export type NotificationsPayload = {
    unreadCount: number;
    notifications: NotificationItem[];
};

export const getMyNotifications = async () => {
    const response = await apiClient.get("/notifications");
    return response.data.data as NotificationsPayload;
};

export const markAllNotificationsRead = async () => {
    const response = await apiClient.post("/notifications/mark-all-read");
    return response.data.data as { markedCount: number };
};
