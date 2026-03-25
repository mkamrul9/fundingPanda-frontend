"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getAllUsers, toggleUserBan } from "@/services/admin.service";
import { User } from "@/types";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Users, Mail, Calendar } from "lucide-react";

type PlatformUser = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "SPONSOR" | "STUDENT";
    isBanned?: boolean;
    createdAt: string;
};

type UsersQueryResponse = {
    data: PlatformUser[];
    meta?: {
        page?: number;
        totalPage?: number;
        total?: number;
        limit?: number;
    };
};

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;
    const currentUser = session?.user as unknown as User | undefined;
    const isAdmin = currentUser?.role === "ADMIN";

    const { data: usersResponse, isLoading } = useQuery<UsersQueryResponse>({
        queryKey: ["allUsers", currentPage],
        queryFn: () => getAllUsers({ page: currentPage, limit: PAGE_SIZE }),
        enabled: isAdmin,
    });

    const users = usersResponse?.data ?? [];
    const totalPages = Math.max(1, Number(usersResponse?.meta?.totalPage ?? 1));

    const banMutation = useMutation({
        mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) => toggleUserBan(userId, isBanned),
        onSuccess: (_data, variables) => {
            toast.success(variables.isBanned ? "User banned successfully." : "User unbanned successfully.");
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        },
        onError: () => {
            toast.error("Failed to update user ban status.");
        },
    });

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
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Joined Date</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="ml-auto h-8 w-20" /></td>
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
                                        <td className="px-6 py-4">
                                            <Badge variant={user.isBanned ? "destructive" : "secondary"}>
                                                {user.isBanned ? "BANNED" : "ACTIVE"}
                                            </Badge>
                                        </td>
                                        <td className="flex items-center gap-2 px-6 py-4"><Calendar className="h-4 w-4 text-neutral-400" /> {new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant={user.isBanned ? "outline" : "destructive"}
                                                size="sm"
                                                disabled={banMutation.isPending || user.id === currentUser?.id || user.role === "ADMIN"}
                                                onClick={() => banMutation.mutate({ userId: user.id, isBanned: !Boolean(user.isBanned) })}
                                            >
                                                {user.isBanned ? "Unban" : "Ban"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!isLoading && totalPages > 1 && (
                        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                            <p className="text-sm text-neutral-500">Page {currentPage} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage <= 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage >= totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
