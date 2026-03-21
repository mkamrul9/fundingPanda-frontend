import axios from 'axios';

const resolveApiBaseUrl = () => {
    const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:5000/api/v1';
    return raw.replace(/\/$/, '');
};

export const apiClient = axios.create({
    baseURL: resolveApiBaseUrl(),
    withCredentials: true, // This ensures BetterAuth session cookies are sent to the backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: add interceptors here later to globally handle 401 Unauthorized errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the backend says unauthorized, we could trigger a redirect to login here
        return Promise.reject(error);
    }
);