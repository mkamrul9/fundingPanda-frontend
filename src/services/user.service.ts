import { apiClient } from "@/lib/axios";

export const getUserProfile = async () => {
    // apiClient automatically attaches the BetterAuth cookie!
    const response = await apiClient.get('/users/me');
    return response.data.data; // Assuming your backend wraps data in { success: true, data: { ... } }
};

export const updateUserProfile = async (payload: { name: string; bio?: string; university?: string; role?: "STUDENT" | "SPONSOR" }) => {
    const response = await apiClient.patch('/users/me', payload);
    return response.data.data;
};

export const updateProfile = async (data: { name?: string; bio?: string; university?: string; role?: "STUDENT" | "SPONSOR" }) => {
    const response = await apiClient.patch('/users/me', data);
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

export const getEmailVerificationStatus = async (email: string) => {
    const response = await apiClient.get('/users/email-verification-status', {
        params: { email },
    });
    return response.data.data as { exists: boolean; emailVerified: boolean };
};