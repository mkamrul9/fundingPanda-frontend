"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn, useSession } from "@/lib/auth-client";
import { ShieldAlert, GraduationCap, Lock, Mail, Chrome, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeSocialProvider, setActiveSocialProvider] = useState<"google" | "github" | null>(null);
    const isGoogleDisabled = process.env.NEXT_PUBLIC_DISABLE_GOOGLE_OAUTH === "true";

    useEffect(() => {
        if (session?.user) {
            router.replace("/dashboard");
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
                callbackURL: "/dashboard",
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
        setEmail("admin@fundingpanda.com");
        setPassword("password123");
        toast.info("Admin credentials auto-filled. Click Sign In.");
    };

    const handleDemoStudent = () => {
        setEmail("student@university.edu");
        setPassword("password123");
        toast.info("Student credentials auto-filled. Click Sign In.");
    };

    const handleSocialLogin = async (provider: "google" | "github") => {
        if (provider === "google" && isGoogleDisabled) {
            toast.info("Google OAuth is currently disabled. Use Demo Admin/Student or GitHub login.");
            return;
        }

        setActiveSocialProvider(provider);
        setIsLoading(true);

        try {
            await signIn.social({
                provider,
                callbackURL: "/dashboard",
            });
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
                                    type="password"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
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

                    <div className="grid grid-cols-2 gap-4">
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
                            onClick={() => handleSocialLogin("github")}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <Github className="h-4 w-4" />
                            GitHub
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

