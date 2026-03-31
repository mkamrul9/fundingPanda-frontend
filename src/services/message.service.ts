import { apiClient } from "@/lib/axios";

// Fetch chat history between the logged-in user and another specific user
export const getChatHistory = async (receiverId: string) => {
    const response = await apiClient.get(`/messages/${receiverId}`);
    return response.data.data;
};

// Fetch a list of all users the logged-in user has chatted with
export const getConversations = async () => {
    const response = await apiClient.get('/messages/conversations');
    return response.data.data;
};

export const uploadChatImage = async (file: File, receiverId: string) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("receiverId", receiverId);

    const response = await apiClient.post('/messages/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const sendTextMessage = async (payload: { receiverId: string; content: string }) => {
    const response = await apiClient.post('/messages', payload);
    return response.data.data;
};
