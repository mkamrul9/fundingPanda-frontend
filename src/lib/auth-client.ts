import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // This points to your Node.js server. BetterAuth automatically appends /api/auth to this base URL!
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
});

export const { signIn, signUp, signOut, useSession } = authClient;