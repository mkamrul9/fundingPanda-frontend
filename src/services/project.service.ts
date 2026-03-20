import { apiClient } from "@/lib/axios";

export const getPublicProjects = async () => {
    // We only want to show projects that Admins have approved!
    const response = await apiClient.get('/projects?status=APPROVED&limit=6');
    return response.data.data;
};

export const getAllProjects = async (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams({ status: "APPROVED" });

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

    if (params.startDate) {
        query.append("createdAt[gte]", String(params.startDate));
    }

    if (params.endDate) {
        query.append("createdAt[lte]", String(params.endDate));
    }

    const response = await apiClient.get(`/projects?${query.toString()}`);
    return response.data.data;
};

export const getCategories = async () => {
    const response = await apiClient.get('/categories');
    return response.data.data;
};

export const createProject = async (formData: FormData) => {
    // Use multipart/form-data for file uploads (images, attachments, etc.)
    const response = await apiClient.post('/projects/create-project', formData, {
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


export const submitProjectForReview = async (projectId: string) => {
    // Since your backend expects form-data for the PATCH route, we wrap the status update in FormData
    const formData = new FormData();
    formData.append("data", JSON.stringify({ status: "PENDING" }));

    const response = await apiClient.patch(`/projects/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};