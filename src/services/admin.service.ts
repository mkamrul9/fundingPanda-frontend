import { apiClient } from "@/lib/axios";

export const getPendingProjects = async () => {
    const response = await apiClient.get('/admin/projects/moderation');
    return response.data.data;
};

export const moderateProject = async ({
    projectId,
    status,
    adminFeedback
}: {
    projectId: string;
    status: "APPROVED" | "DRAFT";
    adminFeedback?: string;
}) => {
    const response = await apiClient.patch(`/admin/projects/${projectId}/status`, {
        status,
        adminFeedback,
    });
    return response.data.data;
};