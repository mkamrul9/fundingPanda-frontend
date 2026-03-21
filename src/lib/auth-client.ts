import { createAuthClient } from "better-auth/react";

const resolveAuthBaseUrl = () => {
    const explicitAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL?.trim();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
    const rawBase = explicitAuthUrl || backendUrl || "http://localhost:5000";

    // BetterAuth client appends /api/auth automatically.
    return rawBase.replace(/\/api\/auth\/?$/, "").replace(/\/$/, "");
};

export const authClient = createAuthClient({
    baseURL: resolveAuthBaseUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;