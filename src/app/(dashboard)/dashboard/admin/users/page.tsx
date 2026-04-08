"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getAllUsers } from "@/services/admin.service";
import { User } from "@/types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Users, Mail, Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react";

type PlatformUser = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "SPONSOR" | "STUDENT";
    isBanned?: boolean;
    isVerified?: boolean;
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
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const currentUser = session?.user as unknown as User | undefined;
    const isAdmin = currentUser?.role === "ADMIN";

    const { data: usersResponse, isLoading } = useQuery<UsersQueryResponse>({
        queryKey: ["allUsers", "directory"],
        queryFn: () => getAllUsers({ page: 1, limit: 500 }),
        enabled: isAdmin,
    });

    const users = usersResponse?.data ?? [];
    const filteredUsers = users.filter((user) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q);
    });

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
    const currentTableData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>User Directory</CardTitle>
                        <CardDescription>A complete list of accounts registered on FundingPanda.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name or email..."
                            className="bg-background pl-8"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        </tr>
                                    ))
                                ) : currentTableData.map((user) => (
                                    <tr key={user.id} className="bg-card transition-colors hover:bg-muted/50">
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "SPONSOR" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {currentTableData.length === 0 && !isLoading && (
                        <div className="py-8 text-center text-muted-foreground">No users match your search.</div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
