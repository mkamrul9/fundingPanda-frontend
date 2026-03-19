import { apiClient } from "@/lib/axios";

export const getPublicProjects = async () => {
    // We only want to show projects that Admins have approved!
    const response = await apiClient.get('/projects?status=APPROVED&limit=6');
    return response.data.data;
};

export const getAllProjects = async (params: Record<string, any> = {}) => {
    // Use native URLSearchParams to safely encode the query string
    const query = new URLSearchParams({ status: "APPROVED" });

    // Dynamically append any filter that actually has a value
    Object.entries(params).forEach(([key, value]) => {
        if (value && value !== "ALL") {
            query.append(key, String(value));
        }
    });

    const response = await apiClient.get(`/projects?${query.toString()}`);
    return response.data.data;
};

export const getCategories = async () => {
    const response = await apiClient.get('/categories');
    return response.data.data;
};