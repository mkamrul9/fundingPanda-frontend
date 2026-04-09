import { apiClient } from "@/lib/axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export type UpsertProjectPayload = {
    title: string;
    description: string;
    goalAmount: number;
    categoryId?: string;
    status: "DRAFT" | "PENDING";
};

export type UploadFilesPayload = {
    pitchDoc?: File | null;
    images?: FileList | null;
};

const toProjectFormData = (payload: UpsertProjectPayload, files?: UploadFilesPayload) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify({
        title: payload.title,
        description: payload.description,
        goalAmount: payload.goalAmount,
        categories: payload.categoryId ? [payload.categoryId] : [],
        status: payload.status,
    }));

    if (files?.pitchDoc) {
        formData.append("pitchDoc", files.pitchDoc);
    }

    if (files?.images) {
        Array.from(files.images).forEach((file) => {
            formData.append("images", file);
        });
    }

    return formData;
};

export const getPublicProjects = async () => {
    // We only want to show projects that Admins have approved!
    const response = await apiClient.get('/projects?status=APPROVED&limit=6&include=categories');
    return response.data.data;
};

export const getAllProjects = async (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams({ status: "APPROVED" });

    query.append("include", "student,categories");

    const sortValue = String(params.sortBy ?? "-createdAt");
    if (sortValue.startsWith("-")) {
        query.append("sortBy", sortValue.slice(1));
        query.append("sortOrder", "desc");
    } else {
        query.append("sortBy", sortValue);
        query.append("sortOrder", "asc");
    }

    const combinedSearchTerm = [params.searchTerm, params.studentName]
        .filter((value) => Boolean(value))
        .map((value) => String(value))
        .join(" ")
        .trim();

    if (combinedSearchTerm) {
        query.append("searchTerm", combinedSearchTerm);
    }

    if (params.university) {
        query.append("student.university", String(params.university));
    }

    if (params.category && String(params.category) !== "ALL") {
        query.append("categories.some.id", String(params.category));
    }

    if (params.startDate) {
        query.append("createdAt[gte]", String(params.startDate));
    }

    if (params.endDate) {
        query.append("createdAt[lte]", String(params.endDate));
    }

    // Pass through additional query params for pagination and custom filters.
    const handledKeys = new Set([
        "status",
        "sortBy",
        "searchTerm",
        "studentName",
        "university",
        "category",
        "startDate",
        "endDate",
    ]);

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (handledKeys.has(key)) return;
        query.append(key, String(value));
    });

    const response = await apiClient.get(`/projects?${query.toString()}`);
    return response.data.data;
};

export const getAllProjectsPaginated = async (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams({ status: "APPROVED" });

    query.append("include", "student,categories");

    const sortValue = String(params.sortBy ?? "-createdAt");
    if (sortValue.startsWith("-")) {
        query.append("sortBy", sortValue.slice(1));
        query.append("sortOrder", "desc");
    } else {
        query.append("sortBy", sortValue);
        query.append("sortOrder", "asc");
    }

    const combinedSearchTerm = [params.searchTerm, params.studentName]
        .filter((value) => Boolean(value))
        .map((value) => String(value))
        .join(" ")
        .trim();

    if (combinedSearchTerm) {
        query.append("searchTerm", combinedSearchTerm);
    }

    if (params.university) {
        query.append("student.university", String(params.university));
    }

    if (params.category && String(params.category) !== "ALL") {
        query.append("categories.some.id", String(params.category));
    }

    if (params.startDate) {
        query.append("createdAt[gte]", String(params.startDate));
    }

    if (params.endDate) {
        query.append("createdAt[lte]", String(params.endDate));
    }

    const handledKeys = new Set([
        "status",
        "sortBy",
        "searchTerm",
        "studentName",
        "university",
        "category",
        "startDate",
        "endDate",
    ]);

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (handledKeys.has(key)) return;
        query.append(key, String(value));
    });

    const response = await apiClient.get(`/projects?${query.toString()}`);
    return {
        data: response.data.data,
        meta: response.data.meta,
    };
};

export const getExploreProjects = async (params: {
    searchTerm?: string;
    category?: string;
    university?: string;
    status?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
}) => {
    const query = new URLSearchParams();

    // Public listing endpoint currently enforces approved-only projects server-side.
    query.append("status", params.status || "APPROVED");

    if (params.searchTerm) {
        query.append("searchTerm", params.searchTerm);
    }

    // QueryBuilder supports nested relation filtering on student.university.
    if (params.university) {
        query.append("student.university", params.university);
    }

    // Include relation data required by the listing cards and category filter client pass.
    query.append("include", "student,categories");

    if (params.page) {
        query.append("page", String(params.page));
    }

    if (params.limit) {
        query.append("limit", String(params.limit));
    }

    const sortValue = params.sortBy || "createdAt_desc";
    const [field, order] = sortValue.split("_");
    query.append("sortBy", field || "createdAt");
    query.append("sortOrder", order === "asc" ? "asc" : "desc");

    const response = await apiClient.get(`/projects?${query.toString()}`);

    return {
        data: response.data.data,
        meta: response.data.meta,
    };
};

export const getProjectById = async (projectId: string) => {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data.data;
};

export const getProjectPitchDocUrl = (projectId: string) => `${API_BASE_URL}/projects/${projectId}/pitch-doc`;
export const getProjectPitchDocDownloadUrl = (projectId: string) => `${API_BASE_URL}/projects/${projectId}/pitch-doc/download`;

export const getCategories = async () => {
    const response = await apiClient.get('/categories');
    return response.data.data;
};

export const createProject = async (payload: UpsertProjectPayload, files?: UploadFilesPayload) => {
    const formData = toProjectFormData(payload, files);
    const response = await apiClient.post('/projects/create-project', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

export const updateProject = async (projectId: string, payload: UpsertProjectPayload, files?: UploadFilesPayload) => {
    const formData = toProjectFormData(payload, files);
    const response = await apiClient.patch(`/projects/${projectId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

// Fetch projects belonging to the currently logged-in student
export const getMyProjects = async () => {
    const response = await apiClient.get('/projects/my-projects');
    return response.data.data;
};

export const getMyProjectById = async (projectId: string) => {
    const response = await apiClient.get(`/projects/my-projects/${projectId}`);
    return response.data.data;
};


export const submitProjectForReview = async (projectId: string) => {
    // Since your backend expects form-data for the PATCH route, we wrap the status update in FormData
    const formData = new FormData();
    formData.append("data", JSON.stringify({ status: "PENDING" }));

    const response = await apiClient.patch(`/projects/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const completeProject = async (projectId: string) => {
    const response = await apiClient.patch(`/projects/${projectId}/complete`);
    return response.data.data;
};

export const markProjectAsCompleted = async (projectId: string) => {
    const response = await apiClient.patch(`/projects/${projectId}/complete`);
    return response.data.data;
};

export const deleteProject = async (projectId: string) => {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data.data;
};