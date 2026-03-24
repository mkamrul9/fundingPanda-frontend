"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmailVerificationStatus } from "@/services/user.service";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = useMemo(() => searchParams.get("email")?.trim() || "", [searchParams]);

    const [isChecking, setIsChecking] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const resolveAuthBaseUrl = () => {
        const explicitAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL?.trim();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
        const rawBase = explicitAuthUrl || backendUrl || "http://localhost:5000";
        return rawBase.replace(/\/api\/auth\/?$/, "").replace(/\/$/, "");
    };

    const checkStatus = async (silent = false) => {
        if (!email) return;

        try {
            if (!silent) setIsChecking(true);
            const result = await getEmailVerificationStatus(email);

            if (!result.exists) {
                if (!silent) toast.error("No account found for this email. Please sign up first.");
                return;
            }

            if (result.emailVerified) {
                toast.success("Email verified. Please login to continue.");
                router.replace(`/login?verified=1&email=${encodeURIComponent(email)}`);
                return;
            }

            if (!silent) {
                toast.info("Email is still not verified. Please click the verification link from your inbox.");
            }
        } catch {
            if (!silent) toast.error("Could not check verification status. Please try again.");
        } finally {
            if (!silent) setIsChecking(false);
        }
    };

    useEffect(() => {
        if (!email) {
            toast.error("Missing email. Please sign up again.");
            router.replace("/register");
            return;
        }

        const interval = setInterval(() => {
            void checkStatus(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [email]);

    const resendVerification = async () => {
        if (!email) {
            toast.error("Missing email. Please sign up again.");
            return;
        }

        try {
            setIsResending(true);
            const base = resolveAuthBaseUrl();
            const response = await fetch(`${base}/api/auth/send-verification-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    callbackURL: `${window.location.origin}/login`,
                }),
            });

            if (!response.ok) {
                const raw = await response.text();
                throw new Error(raw || "Failed to resend verification email");
            }

            toast.success("Verification email sent. Please check your inbox and spam folder.");
        } catch {
            toast.error("Could not resend verification email. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-none bg-transparent w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
                    <CardDescription>
                        We sent a verification link to <span className="font-medium">{email || "your email"}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Click the verification link in your inbox. Once verified, this page will automatically redirect you to login.
                    </p>
                    <Button onClick={() => void checkStatus()} disabled={isChecking} className="w-full">
                        {isChecking ? "Checking..." : "I already verified"}
                    </Button>
                    <Button variant="outline" onClick={() => void resendVerification()} disabled={isResending} className="w-full">
                        {isResending ? "Sending..." : "Resend verification email"}
                    </Button>
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

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
