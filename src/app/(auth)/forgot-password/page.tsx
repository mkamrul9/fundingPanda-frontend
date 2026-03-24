"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please provide your email.");
            return;
        }

        try {
            setIsLoading(true);
            const base = resolveAuthBaseUrl();
            const response = await fetch(`${base}/api/auth/request-password-reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email.trim(),
                    redirectTo: `${window.location.origin}/reset-password`,
                }),
            });

            if (!response.ok) {
                const raw = await response.text();
                throw new Error(raw || "Failed to request password reset");
            }

            toast.success("If this email exists, a reset link has been sent.");
        } catch {
            toast.error("Could not send reset link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-none bg-transparent w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Forgot password</CardTitle>
                    <CardDescription>Enter your email to receive a password reset link.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="panda@university.edu"
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send reset link"}
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
