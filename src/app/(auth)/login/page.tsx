"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { loginSchema, emailSchema, passwordSchema } from "@/lib/validations/auth";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const Form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            // Final full-form safety check
            const validation = loginSchema.safeParse(value);
            if (!validation.success) {
                toast.error("Please fix the errors before submitting.");
                return;
            }

            setIsLoading(true);

            const { error } = await signIn.email({
                email: value.email,
                password: value.password,
            });

            setIsLoading(false);

            if (error) {
                toast.error(error.message || "Failed to log in. Please check your credentials.");
                return;
            }

            toast.success("Successfully logged in!");
            router.push("/dashboard");
        },
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-none bg-transparent w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
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

