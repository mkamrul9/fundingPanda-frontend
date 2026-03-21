import { apiClient } from "@/lib/axios";

export type ResourceType = "HARDWARE" | "SOFTWARE";

export type CreateResourceInput = {
    title: string;
    description: string;
    capacity: number;
    type?: ResourceType;
};

export const getAllResources = async () => {
    const response = await apiClient.get('/resources');
    return response.data.data;
};

export const getAllResourcesPaginated = async (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        query.append(key, String(value));
    });

    const response = await apiClient.get(`/resources${query.toString() ? `?${query.toString()}` : ""}`);
    return {
        data: response.data.data,
        meta: response.data.meta,
    };
};

export const createResource = async (data: CreateResourceInput) => {
    const normalizedType: ResourceType = data.type || "HARDWARE";
    const normalizedCapacity = Number.isFinite(data.capacity) ? Math.max(1, Math.floor(data.capacity)) : 1;

    const payload = {
        name: data.title,
        description: data.description,
        type: normalizedType,
        totalCapacity: normalizedType === "SOFTWARE" ? normalizedCapacity : 1,
    };

    const response = await apiClient.post('/resources', payload);
    return response.data.data;
};

export const claimResource = async (resourceId: string, projectId: string) => {
    const response = await apiClient.post(`/resources/${resourceId}/claim`, { projectId });
    return response.data.data;
};

export const getMyResourceClaims = async () => {
    const response = await apiClient.get('/resources/my-claims');
    return response.data.data;
};

export const getMyClaims = async () => {
    const response = await apiClient.get('/resources/my-claims');
    return response.data.data;
};

export const deleteResource = async (resourceId: string) => {
    const response = await apiClient.delete(`/resources/${resourceId}`);
    return response.data.data;
};
