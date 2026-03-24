"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const resolveAuthBaseUrl = () => {
    const explicitAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL?.trim();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
    const rawBase = explicitAuthUrl || backendUrl || "http://localhost:5000";
    return rawBase.replace(/\/api\/auth\/?$/, "").replace(/\/$/, "");
};

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid or expired reset link.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            setIsLoading(true);
            const base = resolveAuthBaseUrl();
            const response = await fetch(`${base}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    token,
                    newPassword,
                }),
            });

            if (!response.ok) {
                const raw = await response.text();
                throw new Error(raw || "Failed to reset password");
            }

            toast.success("Password reset successful. Please login with your new password.");
            router.replace("/login");
        } catch {
            toast.error("Could not reset password. The link may be expired.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-none bg-transparent w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Reset password</CardTitle>
                    <CardDescription>Choose a new password for your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm new password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading || !token}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border/50 p-4">
                    <p className="text-sm text-muted-foreground">
                        Back to <Link href="/login" className="font-semibold text-primary hover:underline">Login</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
