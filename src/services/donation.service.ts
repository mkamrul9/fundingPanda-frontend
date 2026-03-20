import { apiClient } from "@/lib/axios";

export const getMyDonations = async () => {
    // Backend route expected to return donations for the logged-in user
    const response = await apiClient.get('/donations/me');
    return response.data.data;
};

export default {
    getMyDonations,
};
