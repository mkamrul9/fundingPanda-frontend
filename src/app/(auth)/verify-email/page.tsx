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
