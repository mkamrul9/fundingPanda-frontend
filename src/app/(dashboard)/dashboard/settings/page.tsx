"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { updateProfile } from "@/services/user.service";
import { User } from "@/types";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserCircle, Save } from "lucide-react";

export default function SettingsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;

    const [formData, setFormData] = useState({
        name: undefined as string | undefined,
        bio: undefined as string | undefined,
        university: undefined as string | undefined,
    });

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            toast.success("Profile updated successfully!");
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({
            name: formData.name ?? session?.user?.name ?? "",
            bio: formData.bio ?? ((session?.user as unknown as { bio?: string })?.bio || ""),
            university: formData.university ?? ((session?.user as unknown as { university?: string })?.university || ""),
        });
    };

    return (
        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    <UserCircle className="h-8 w-8 text-primary" /> Account Settings
                </h1>
                <p className="text-muted-foreground">Manage your public profile information.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>This information appears on your public page and next to your projects.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                value={formData.name ?? session?.user?.name ?? ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={updateMutation.isPending}
                            />
                        </div>

                        {(currentUser?.role === "STUDENT" || currentUser?.role === "SPONSOR" || currentUser?.role === "ADMIN") && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">University / Institution</label>
                                <Input
                                    placeholder="e.g., MIT, Stanford, Independent"
                                    value={formData.university ?? ((session?.user as unknown as { university?: string })?.university || "")}
                                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                    disabled={updateMutation.isPending}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bio</label>
                            <Textarea
                                placeholder="Tell sponsors about your background, research interests, and goals..."
                                value={formData.bio ?? ((session?.user as unknown as { bio?: string })?.bio || "")}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="min-h-30"
                                disabled={updateMutation.isPending}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-neutral-50 px-6 py-4">
                        <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                            <Save className="h-4 w-4" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
