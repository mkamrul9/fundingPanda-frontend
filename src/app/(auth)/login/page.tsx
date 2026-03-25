"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { toast } from "sonner";
import { signIn, authClient, useSession } from "@/lib/auth-client";
import { getEmailVerificationStatus } from "@/services/user.service";
import { loginSchema, emailSchema, passwordSchema } from "@/lib/validations/auth";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const alreadySignedToastShownRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (session?.user && !alreadySignedToastShownRef.current) {
            alreadySignedToastShownRef.current = true;
            toast.info("You are already signed in.");
            router.replace("/dashboard");
        }
    }, [session, router]);

    const parseAuthError = (raw: unknown) => {
        const err = (raw ?? {}) as {
            status?: number;
            code?: string;
            message?: string;
        };

        const code = (err.code || "").toUpperCase();
        const message = (err.message || "").toLowerCase();

        const isUserMissing =
            code.includes("USER_NOT_FOUND") ||
            code.includes("ACCOUNT_NOT_FOUND") ||
            message.includes("user not found") ||
            message.includes("account not found") ||
            message.includes("no account") ||
            message.includes("not registered") ||
            message.includes("does not exist");

        const isInvalidCredential =
            code.includes("INVALID_EMAIL_OR_PASSWORD") ||
            code.includes("INVALID_CREDENTIAL") ||
            message.includes("invalid email or password") ||
            message.includes("incorrect email or password") ||
            message.includes("invalid credentials") ||
            message.includes("wrong password");

        const isUnverifiedUser =
            code.includes("EMAIL_NOT_VERIFIED") ||
            code.includes("UNVERIFIED") ||
            message.includes("email not verified") ||
            message.includes("verify your email") ||
            message.includes("verification required");

        if (err.status === 404 || isUserMissing) {
            return "This email has no account yet. Please register first.";
        }
        if (isUnverifiedUser) {
            return "Your email is not verified yet. Please verify your email first.";
        }
        if (
            err.status === 401 ||
            err.status === 403 ||
            isInvalidCredential
        ) {
            return "Incorrect email or password. Please try again.";
        }
        return err.message || "Authentication failed. Please try again.";
    };

    const resolveFrontendBaseUrl = () => {
        const explicitFrontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.trim();
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
        const rawBase = explicitFrontendUrl || currentOrigin || "http://localhost:3000";
        return rawBase.replace(/\/$/, "");
    };

    const Form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            const validation = loginSchema.safeParse(value);
            if (!validation.success) {
                toast.error("Please fix the errors before submitting.");
                return;
            }

            // Use BetterAuth lifecycle callbacks so UI updates align with auth flow
            try {
                await signIn.email(
                    {
                        email: value.email,
                        password: value.password,
                        callbackURL: `${resolveFrontendBaseUrl()}/login`,
                    },
                    {
                        onRequest: () => {
                            setIsLoading(true);
                        },
                        onSuccess: () => {
                            void (async () => {
                                try {
                                    const session = await authClient.getSession();
                                    setIsLoading(false);
                                    if (session?.data?.user) {
                                        toast.success("Successfully logged in!");
                                        router.replace("/dashboard");
                                        return;
                                    }
                                    toast.error("Login succeeded but session was not established. Please try again.");
                                } catch {
                                    setIsLoading(false);
                                    toast.error("Login succeeded but session check failed. Please try again.");
                                }
                            })();
                        },
                        onError: async (ctx: unknown) => {
                            setIsLoading(false);
                            const rawError = (ctx as { error?: unknown })?.error ?? ctx;
                            const errorObj = (rawError ?? {}) as { code?: string; message?: string };
                            const code = (errorObj.code || '').toUpperCase();
                            const message = (errorObj.message || '').toLowerCase();

                            if (
                                code.includes('EMAIL_NOT_VERIFIED') ||
                                code.includes('UNVERIFIED') ||
                                message.includes('email not verified') ||
                                message.includes('verify your email')
                            ) {
                                toast.error('Please verify your email before logging in.');
                                router.push(`/verify-email?email=${encodeURIComponent(value.email)}`);
                                return;
                            }

                            if (
                                code.includes('INVALID_EMAIL_OR_PASSWORD') ||
                                code.includes('INVALID_CREDENTIAL') ||
                                message.includes('invalid email or password') ||
                                message.includes('incorrect email or password')
                            ) {
                                try {
                                    const status = await getEmailVerificationStatus(value.email);
                                    if (!status.exists) {
                                        toast.error('No account found with this email. Please create an account first.');
                                        return;
                                    }
                                } catch {
                                    // Keep fallback message below if status lookup fails.
                                }
                            }

                            const errorMessage = parseAuthError(rawError);
                            toast.error(errorMessage);
                        },
                    }
                );
            } catch (err) {
                setIsLoading(false);
                toast.error(parseAuthError(err));
            }
        },
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-none bg-transparent w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-start">
                        <Link href="/" className="text-sm font-semibold text-primary hover:underline">
                            Home
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                    <CardDescription>Enter your email and password to access your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            Form.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        <Form.Field
                            name="email"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = emailSchema.safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Email</Label>
                                    <Input
                                        id={field.name}
                                        type="email"
                                        placeholder="panda@university.edu"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        disabled={isLoading}
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                                    )}
                                </div>
                            )}
                        </Form.Field>

                        <Form.Field
                            name="password"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = passwordSchema.safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor={field.name}>Password</Label>
                                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id={field.name}
                                            type={showPassword ? "text" : "password"}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            disabled={isLoading}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground focus:outline-none"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                                    )}
                                </div>
                            )}
                        </Form.Field>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border/50 p-4">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account? {" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

