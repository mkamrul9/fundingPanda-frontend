"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn, useSession } from "@/lib/auth-client";
import { ShieldAlert, GraduationCap, Lock, Mail, Chrome, Eye, EyeOff, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSocialProvider, setActiveSocialProvider] = useState<"google" | "facebook" | null>(null);
    const isGoogleDisabled = process.env.NEXT_PUBLIC_DISABLE_GOOGLE_OAUTH === "true";
    const isFacebookDisabled = process.env.NEXT_PUBLIC_DISABLE_FACEBOOK_OAUTH === "true";

    const resolveFrontendBaseUrl = () => {
        const explicitFrontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.trim();
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
        const rawBase = explicitFrontendUrl || currentOrigin || "http://localhost:3000";
        return rawBase.replace(/\/$/, "");
    };

    useEffect(() => {
        if (session?.user) {
            router.replace("/dashboard");
            return;
        }

        // Some OAuth providers can return to /login before React session state hydrates.
        const oauthSuccess = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("oauth") === "success";
        if (oauthSuccess) {
            const timer = setTimeout(() => {
                router.replace("/dashboard");
            }, 350);

            return () => clearTimeout(timer);
        }
    }, [session, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signIn.email({
                email,
                password,
                callbackURL: `${resolveFrontendBaseUrl()}/dashboard`,
            });

            if (result.error) {
                toast.error(result.error.message || "Invalid credentials. Please try again.");
                return;
            }

            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoAdmin = () => {
        setEmail("admin@panda.com");
        setPassword("12345678");
        toast.info("Admin credentials auto-filled. Click Sign In.");
    };

    const handleDemoStudent = () => {
        setEmail("student@panda.com");
        setPassword("12345678");
        toast.info("Student credentials auto-filled. Click Sign In.");
    };

    const handleSocialLogin = async (provider: "google" | "facebook") => {
        if (provider === "google" && isGoogleDisabled) {
            toast.info("Google OAuth is currently disabled. Use Demo Admin/Student login.");
            return;
        }

        if (provider === "facebook" && isFacebookDisabled) {
            toast.info("Facebook OAuth is currently disabled. Use email or Google login.");
            return;
        }

        setActiveSocialProvider(provider);
        setIsLoading(true);

        try {
            const dashboardUrl = `${resolveFrontendBaseUrl()}/dashboard?oauth=success`;
            const result = await signIn.social({
                provider,
                callbackURL: dashboardUrl,
                newUserCallbackURL: dashboardUrl,
            });

            if (result?.error) {
                toast.error(result.error.message || `Failed to initialize ${provider} login.`);
                setIsLoading(false);
                setActiveSocialProvider(null);
            }
        } catch {
            toast.error(`Failed to initialize ${provider} login.`);
            setIsLoading(false);
            setActiveSocialProvider(null);
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="w-full border-primary/10 shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                        <span className="col-span-2 mb-1 text-center text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                            Demo Quick Access
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={handleDemoAdmin}
                            className="gap-1 border-emerald-200 text-xs hover:bg-emerald-100"
                        >
                            <ShieldAlert className="h-3 w-3" />
                            Admin
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={handleDemoStudent}
                            className="gap-1 border-emerald-200 text-xs hover:bg-emerald-100"
                        >
                            <GraduationCap className="h-3 w-3" />
                            Student
                        </Button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@university.edu"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="pl-10 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && !activeSocialProvider ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => handleSocialLogin("google")}
                            disabled={isLoading || isGoogleDisabled}
                            className="gap-2"
                        >
                            <Chrome className="h-4 w-4" />
                            {isGoogleDisabled ? "Google (Off)" : "Google"}
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => handleSocialLogin("facebook")}
                            disabled={isLoading || isFacebookDisabled}
                            className="gap-2"
                        >
                            <Globe className="h-4 w-4" />
                            {isFacebookDisabled ? "Facebook (Off)" : "Facebook"}
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 text-center">
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Create an account
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

