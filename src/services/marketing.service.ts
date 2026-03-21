import { apiClient } from "@/lib/axios";

export const subscribeToNewsletter = async (email: string) => {
    const response = await apiClient.post('/newsletter/subscribe', { email });
    return response.data;
};

export const submitContactForm = async (data: { name: string; email: string; subject: string; message: string }) => {
    const response = await apiClient.post('/contact', data);
    return response.data;
};
