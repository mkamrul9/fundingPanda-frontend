import { apiClient } from "@/lib/axios";

export const getUserProfile = async () => {
    // apiClient automatically attaches the BetterAuth cookie!
    const response = await apiClient.get('/users/me');
    return response.data.data; // Assuming your backend wraps data in { success: true, data: { ... } }
};

export const updateUserProfile = async (payload: { name: string; bio?: string; university?: string }) => {
    const response = await apiClient.patch('/users/me', payload);
    return response.data.data;
};

// Fetch a public user profile by ID
export const getUserById = async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
};

export const getTopSponsors = async () => {
    const response = await apiClient.get('/users/top-sponsors');
    return response.data.data;
};