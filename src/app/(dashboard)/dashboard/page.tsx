"use client";

import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
    const { data: session } = useSession();

    if (!session) return null;

    const user = session.user as unknown as User;
    const isStudent = user.role === "STUDENT";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-neutral-500">
                    Welcome back, {user.name}. Here is an overview of your activity.
                </p>
                {isStudent && (
                    <div className="mt-4">
                        <Link href="/dashboard/create-project">
                            <Button>Create Project</Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Placeholder Stat Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Platform Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{user.role.toLowerCase()}</div>
                        <p className="text-xs text-neutral-500">Your current account type</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}