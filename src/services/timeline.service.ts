import { apiClient } from "@/lib/axios";

export type CreateMilestonePayload = {
    projectId: string;
    title: string;
    description: string;
};

export const getProjectTimeline = async (projectId: string) => {
    const response = await apiClient.get(`/timeline/${projectId}`);
    return response.data.data;
};

export const createMilestone = async (data: CreateMilestonePayload) => {
    const response = await apiClient.post('/timeline/milestone', data);
    return response.data.data;
};
