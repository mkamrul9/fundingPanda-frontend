import { apiClient } from "@/lib/axios";

export const getPendingProjects = async () => {
    const response = await apiClient.get('/admin/projects/moderation');
    return response.data.data;
};

export const getPlatformAnalytics = async () => {
    const response = await apiClient.get('/admin/analytics');
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

export const createCategory = async (data: { name: string; description?: string }) => {
    const response = await apiClient.post('/categories', data);
    return response.data.data;
};

export const deleteCategory = async (categoryId: string) => {
    const response = await apiClient.delete(`/categories/${categoryId}`);
    return response.data.data;
};

export const updateCategory = async (
    categoryId: string,
    data: { name: string; description?: string }
) => {
    const response = await apiClient.patch(`/categories/${categoryId}`, data);
    return response.data.data;
};

export const getAllUsers = async () => {
    const response = await apiClient.get('/users');
    return response.data.data;
};

export const toggleUserBan = async (userId: string, isBanned: boolean) => {
    const response = await apiClient.patch(`/admin/users/${userId}/ban`, {
        isBanned,
    });
    return response.data.data;
};

export const getAllDonations = async () => {
    const response = await apiClient.get('/donations');
    return response.data.data;
};