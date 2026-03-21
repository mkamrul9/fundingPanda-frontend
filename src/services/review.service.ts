import { apiClient } from "@/lib/axios";

export const getUserReviews = async (userId: string) => {
    const response = await apiClient.get(`/reviews/user/${userId}`);
    return response.data.data;
};

export const createReview = async (data: { projectId: string; revieweeId: string; rating: number; comment: string }) => {
    const response = await apiClient.post('/reviews', data);
    return response.data.data;
};
