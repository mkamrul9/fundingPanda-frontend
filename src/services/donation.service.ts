import { apiClient } from "@/lib/axios";

export const getMyDonations = async (userId?: string) => {
    if (userId) {
        const fallback = await apiClient.get('/donations', {
            params: { userId, limit: 200 },
        });
        return fallback.data.data || [];
    }

    const response = await apiClient.get('/donations/me');
    return response.data.data;
};
