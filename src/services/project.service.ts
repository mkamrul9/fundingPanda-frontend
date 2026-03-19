import { apiClient } from "@/lib/axios";

export const getPublicProjects = async () => {
    // We only want to show projects that Admins have approved!
    const response = await apiClient.get('/projects?status=APPROVED&limit=6');
    return response.data.data;
};

export const getAllProjects = async (params?: { searchTerm?: string; category?: string }) => {
    let query = '?status=APPROVED'; // Only show approved projects to the public

    if (params?.searchTerm) {
        query += `&searchTerm=${encodeURIComponent(params.searchTerm)}`;
    }
    if (params?.category && params.category !== 'ALL') {
        // Assuming your backend query builder filters by category ID or name
        query += `&categories=${encodeURIComponent(params.category)}`;
    }

    const response = await apiClient.get(`/projects${query}`);
    return response.data.data; // Adjust if your backend returns pagination meta data!
};

export const getCategories = async () => {
    const response = await apiClient.get('/categories');
    return response.data.data;
};