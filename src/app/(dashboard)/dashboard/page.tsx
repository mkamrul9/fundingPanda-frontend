"use client";

import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const { data: session } = useSession();

    if (!session) return null;

    const user = session.user as unknown as User;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-neutral-500">
                    Welcome back, {user.name}. Here is an overview of your activity.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* User profile summary */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Platform Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{user.role.toLowerCase()}</div>
                        <p className="text-xs text-neutral-500">Your current account type</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {user.name}</p>
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">University:</span> {user.university || "Not set"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Badge variant={user.isVerified ? "default" : "outline"}>
                            {user.isVerified ? "Verified" : "Not verified"}
                        </Badge>
                        <p className="text-xs text-neutral-500">Complete your profile and verification to gain trust on the platform.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}