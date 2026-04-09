import { createAuthClient } from "better-auth/react";

const resolveAuthBaseUrl = () => {
    const explicitAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL?.trim();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    const rawBase = explicitAuthUrl || backendUrl || apiUrl || "http://localhost:5000";

    // BetterAuth client appends /api/auth automatically.
    return rawBase
        .replace(/\/api\/auth\/?$/, "")
        .replace(/\/api\/v1\/?$/, "")
        .replace(/\/$/, "");
};

export const authClient = createAuthClient({
    baseURL: resolveAuthBaseUrl(),
    fetchOptions: {
        credentials: "include",
    },
});

export const { signIn, signUp, signOut, useSession } = authClient;