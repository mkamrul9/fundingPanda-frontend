"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { updateProfile } from "@/services/user.service";
import { User } from "@/types";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, Save } from "lucide-react";

export default function SettingsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;

    const [formData, setFormData] = useState({
        name: undefined as string | undefined,
        bio: undefined as string | undefined,
        university: undefined as string | undefined,
        role: undefined as "STUDENT" | "SPONSOR" | undefined,
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

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
            role: formData.role ?? ((session?.user as unknown as { role?: "STUDENT" | "SPONSOR" | "ADMIN" })?.role as "STUDENT" | "SPONSOR" | undefined),
        });
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error("Please fill all password fields.");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("Your password must be 8 characters long.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        try {
            setIsChangingPassword(true);
            const { error } = await authClient.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                revokeOtherSessions: false,
            });

            if (error) {
                throw new Error(error.message || "Failed to change password");
            }

            toast.success("Password changed successfully.");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch {
            toast.error("Could not change password. Please check your current password.");
        } finally {
            setIsChangingPassword(false);
        }
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

                        {(currentUser?.role === "STUDENT" || currentUser?.role === "SPONSOR") && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Account Role</label>
                                <Select
                                    value={formData.role ?? currentUser.role}
                                    onValueChange={(value: "STUDENT" | "SPONSOR") => setFormData({ ...formData, role: value })}
                                    disabled={updateMutation.isPending}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STUDENT">Student</SelectItem>
                                        <SelectItem value="SPONSOR">Sponsor</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Social login users can switch between Student and Sponsor here.
                                </p>
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

            <form onSubmit={handleChangePassword}>
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password for better security.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <Input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                disabled={isChangingPassword}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                disabled={isChangingPassword}
                                minLength={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                disabled={isChangingPassword}
                                minLength={8}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-neutral-50 px-6 py-4">
                        <Button type="submit" disabled={isChangingPassword} className="gap-2">
                            {isChangingPassword ? "Updating..." : "Update Password"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
