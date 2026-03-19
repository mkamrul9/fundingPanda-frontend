import { apiClient } from "@/lib/axios";

export const getPublicProjects = async () => {
    // We only want to show projects that Admins have approved!
    const response = await apiClient.get('/projects?status=APPROVED&limit=6');
    return response.data.data;
};