import { apiClient } from "@/lib/axios";

export const getMyDonations = async (userId?: string) => {
    try {
        const response = await apiClient.get('/donations/me');
        return response.data.data;
    } catch (error: any) {
        // Backward-compatible fallback if backend route is not yet deployed.
        if (error?.response?.status === 404 && userId) {
            const fallback = await apiClient.get('/donations', {
                params: { userId, limit: 200 },
            });
            return fallback.data.data || [];
        }
        throw error;
    }
};

export default {
    getMyDonations,
};
