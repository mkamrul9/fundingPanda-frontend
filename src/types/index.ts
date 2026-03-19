// src/types/index.ts

export type UserRole = "STUDENT" | "SPONSOR" | "ADMIN";

export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    role: UserRole;
    bio?: string | null;
    university?: string | null;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Session {
    id: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    userId: string;
}