"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getAllUsers } from "@/services/admin.service";
import { User } from "@/types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Users, Mail, Calendar } from "lucide-react";

type PlatformUser = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "SPONSOR" | "STUDENT";
    createdAt: string;
};

type UsersQueryResponse = {
    data?: PlatformUser[];
};

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;
    const isAdmin = currentUser?.role === "ADMIN";

    const { data: usersResponse, isLoading } = useQuery<UsersQueryResponse | PlatformUser[]>({
        queryKey: ["allUsers"],
        queryFn: getAllUsers,
        enabled: isAdmin,
    });

    const users = Array.isArray(usersResponse)
        ? usersResponse
        : (usersResponse?.data ?? []);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldAlert className="mb-4 h-16 w-16 text-neutral-300" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    <Users className="h-8 w-8 text-primary" /> Platform Users
                </h1>
                <p className="text-muted-foreground">Monitor and manage all registered Students and Sponsors.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Directory</CardTitle>
                    <CardDescription>A complete list of accounts registered on FundingPanda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        </tr>
                                    ))
                                ) : users.map((user) => (
                                    <tr key={user.id} className="border-b bg-white hover:bg-neutral-50">
                                        <td className="px-6 py-4 font-medium text-neutral-900">{user.name}</td>
                                        <td className="flex items-center gap-2 px-6 py-4"><Mail className="h-4 w-4 text-neutral-400" /> {user.email}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "SPONSOR" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="flex items-center gap-2 px-6 py-4"><Calendar className="h-4 w-4 text-neutral-400" /> {new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
