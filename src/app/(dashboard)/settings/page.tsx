"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserProfile, updateUserProfile } from "@/services/user.service";
import { profileSchema, nameSchema, bioSchema, universitySchema } from "@/lib/validations/user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // 1. Fetch the user's current profile from the Node.js backend
    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
    });

    // 2. Setup the mutation to update the profile
    const updateMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            // Invalidate the cache so the query refetches fresh data
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            router.replace("/dashboard");
        },
        onError: (error: unknown) => {
            const message =
                typeof error === "object" &&
                    error !== null &&
                    "response" in error &&
                    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === "string"
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : "Failed to update profile.";
            toast.error(message);
        },
    });

    // 3. Initialize the form (Wait for data to load so defaultValues are populated)
    const Form = useForm({
        defaultValues: {
            name: profile?.name || "",
            bio: profile?.bio || "",
            university: profile?.university || "",
        },
        onSubmit: async ({ value }) => {
            const validation = profileSchema.safeParse(value);
            if (!validation.success) {
                toast.error("Please fix the errors before saving.");
                return;
            }
            // Trigger the TanStack Query mutation
            updateMutation.mutate(value);
        },
    });
    // Show a loading state while fetching the profile
    if (isLoading) {
        return (
            <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return <div className="text-destructive">Failed to load profile data. Please refresh.</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your public profile and university affiliation.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>
                        This information will be displayed publicly so sponsors or students can learn more about you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            Form.handleSubmit();
                        }}
                        className="space-y-6"
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
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        disabled={updateMutation.isPending}
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                                    )}
                                </div>
                            )}
                        </Form.Field>

                        {/* UNIVERSITY FIELD */}
                        <Form.Field
                            name="university"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = universitySchema.safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>University / Organization</Label>
                                    <Input
                                        id={field.name}
                                        placeholder="e.g., MIT, Stanford, or Independent"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        disabled={updateMutation.isPending}
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                                    )}
                                </div>
                            )}
                        </Form.Field>

                        {/* BIO FIELD */}
                        <Form.Field
                            name="bio"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = bioSchema.safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Bio</Label>
                                    <Textarea
                                        id={field.name}
                                        placeholder="Tell us a little bit about your research or funding goals..."
                                        className="resize-none min-h-25"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        disabled={updateMutation.isPending}
                                    />
                                    <p className="text-xs text-muted-foreground">Maximum 500 characters.</p>
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                                    )}
                                </div>
                            )}
                        </Form.Field>

                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Saving changes..." : "Save changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}