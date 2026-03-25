"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { toast } from "sonner";
import { signUp, useSession } from "@/lib/auth-client";
import { registerSchema, nameSchema, registerEmailSchema, registerPasswordSchema, registerUniversitySchema, registerBioSchema } from "@/lib/validations/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            router.replace("/dashboard");
        }
    }, [session, router]);

    const resolveFrontendBaseUrl = () => {
        const explicitFrontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.trim();
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
        const rawBase = explicitFrontendUrl || currentOrigin || "http://localhost:3000";
        return rawBase.replace(/\/$/, "");
    };

    const parseSignupError = (raw: unknown) => {
        const err = (raw ?? {}) as {
            status?: number;
            code?: string;
            message?: string;
        };

        const code = (err.code || "").toUpperCase();
        const message = (err.message || "").toLowerCase();

        const isExistingUser =
            code.includes("USER_ALREADY_EXISTS") ||
            code.includes("EMAIL_ALREADY_EXISTS") ||
            message.includes("already exists") ||
            message.includes("already registered") ||
            message.includes("email is already") ||
            message.includes("duplicate");

        if (err.status === 409 || isExistingUser) {
            return "An account with that email already exists. Please sign in.";
        }
        if (err.status === 400 || code.includes("INVALID_PAYLOAD") || code.includes("VALIDATION")) {
            return "Invalid registration information. Please check your inputs.";
        }
        return err.message || "Signup failed. Please try again.";
    };

    const Form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "STUDENT" as "STUDENT" | "SPONSOR",
            university: "",
            bio: "",
        },
        onSubmit: async ({ value }) => {
            // Final Zod safety check
            const validation = registerSchema.safeParse(value);
            if (!validation.success) {
                toast.error("Please fix the errors before submitting.");
                return;
            }

            // Use BetterAuth lifecycle callbacks for consistent UX
            try {
                await signUp.email(
                    {
                        name: value.name,
                        email: value.email,
                        password: value.password,
                        callbackURL: `${resolveFrontendBaseUrl()}/login`,
                        // Passing custom data to BetterAuth (it will be saved to your DB if configured)
                        role: value.role,
                        university: value.university?.trim() || undefined,
                        bio: value.bio?.trim() || undefined,
                    } as Parameters<typeof signUp.email>[0],
                    {
                        onRequest: () => setIsLoading(true),
                        onSuccess: () => {
                            setIsLoading(false);
                            toast.success("Account created. Check your email to verify your account.");
                            router.push(`/verify-email?email=${encodeURIComponent(value.email)}`);
                        },
                        onError: (ctx: unknown) => {
                            setIsLoading(false);
                            const errorMessage = parseSignupError((ctx as { error?: unknown })?.error ?? ctx);
                            toast.error(errorMessage);
                        },
                    }
                );
            } catch (err) {
                setIsLoading(false);
                toast.error(parseSignupError(err));
            }
        },
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-start">
                        <Link href="/" className="text-sm font-semibold text-primary hover:underline">
                            Home
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>Join FundingPanda to fund or showcase research.</CardDescription>
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
                        {/* NAME FIELD */}
                        <Form.Field
                            name="name"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = nameSchema.safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Full Name</Label>
                                    <Input
                                        id={field.name}
                                        placeholder="John Doe"
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

                        {/* EMAIL FIELD */}
                        <Form.Field
                            name="email"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = registerEmailSchema.safeParse(value);
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

                        {/* PASSWORD FIELD */}
                        <Form.Field
                            name="password"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = registerPasswordSchema.safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Password</Label>
                                    <Input
                                        id={field.name}
                                        type="password"
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

                        {/* ROLE SELECTION */}
                        <Form.Field
                            name="role"
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>I want to...</Label>
                                    <Select
                                        disabled={isLoading}
                                        value={field.state.value}
                                        onValueChange={(value: "STUDENT" | "SPONSOR") => field.handleChange(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an account type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STUDENT">Showcase my research (Student)</SelectItem>
                                            <SelectItem value="SPONSOR">Fund academic projects (Sponsor)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </Form.Field>

                        <Form.Field
                            name="university"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = registerUniversitySchema.safeParse(value || undefined);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>University (optional)</Label>
                                    <Input
                                        id={field.name}
                                        placeholder="e.g., MIT, Stanford, Independent"
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
                            name="bio"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = registerBioSchema.safeParse(value || undefined);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Bio (optional)</Label>
                                    <Textarea
                                        id={field.name}
                                        placeholder="Tell us about your research interests or funding focus"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        disabled={isLoading}
                                        className="resize-none min-h-24"
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                                    )}
                                </div>
                            )}
                        </Form.Field>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Sign up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                    <p className="text-sm text-neutral-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}