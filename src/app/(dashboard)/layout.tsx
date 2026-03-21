"use client";

import { ReactNode, useEffect } from "react";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { Leaf, LogOut, LayoutDashboard, Settings, Loader2, ShieldCheck, House, MessageSquare, Package, FolderKanban, Rocket, HandCoins, CircleHelp, Tags, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter();

    // Fetch session data from BetterAuth
    const { data: session, isPending } = useSession();

    // Route Protection: If not loading and no session, kick to login
    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
        }
    }, [session, isPending, router]);

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    // Show a loading spinner while checking auth state
    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Prevent rendering protected content if unauthenticated
    if (!session) return null;

    // Cast session user to our application `User` type (we store role there)
    const user = session.user as unknown as User;
    const userRole = (user.role ?? "STUDENT") as string; // STUDENT, SPONSOR, or ADMIN

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full border-b bg-white md:flex md:w-64 md:flex-col md:border-b-0 md:border-r">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-primary" />
                        <span className="text-lg font-bold tracking-tight">
                            Funding<span className="text-primary">Panda</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex flex-col gap-2 p-4 md:flex-1">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start">
                            <House className="mr-2 h-4 w-4" />
                            Home
                        </Button>
                    </Link>

                    <Link href="/leaderboard">
                        <Button variant="ghost" className="w-full justify-start">
                            <Trophy className="mr-2 h-4 w-4" />
                            Leaderboard
                        </Button>
                    </Link>

                    {userRole !== "SPONSOR" && (
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Overview
                            </Button>
                        </Link>
                    )}

                    {/* Dynamic Links based on Role */}
                    {userRole === "STUDENT" && (
                        <>
                            <Link href="/projects">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Leaf className="mr-2 h-4 w-4" />
                                    Explore Ideas
                                </Button>
                            </Link>
                            <Link href="/dashboard/my-projects">
                                <Button variant="ghost" className="w-full justify-start">
                                    <FolderKanban className="mr-2 h-4 w-4" />
                                    My Projects
                                </Button>
                            </Link>
                            <Link href="/dashboard/create-project">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Rocket className="mr-2 h-4 w-4" />
                                    Create Project
                                </Button>
                            </Link>
                            <Link href="/dashboard/resources">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Package className="mr-2 h-4 w-4" />
                                    Resource Hub
                                </Button>
                            </Link>
                            <Link href="/dashboard/my-items">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Package className="mr-2 h-4 w-4" />
                                    My Claimed Items
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="ghost" className="w-full justify-start">
                                    <CircleHelp className="mr-2 h-4 w-4" />
                                    About Us
                                </Button>
                            </Link>
                        </>
                    )}

                    {userRole === "SPONSOR" && (
                        <>
                            <Link href="/projects">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Leaf className="mr-2 h-4 w-4" />
                                    Explore Ideas
                                </Button>
                            </Link>
                            <Link href="/dashboard/messages">
                                <Button variant="ghost" className="w-full justify-start">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Inbox
                                </Button>
                            </Link>
                            <Link href="/dashboard/donations">
                                <Button variant="ghost" className="w-full justify-start">
                                    <HandCoins className="mr-2 h-4 w-4" />
                                    My Donated Projects
                                </Button>
                            </Link>
                            <Link href="/dashboard/resources">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Package className="mr-2 h-4 w-4" />
                                    Resource Hub
                                </Button>
                            </Link>
                            <Link href="/dashboard/my-items">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Package className="mr-2 h-4 w-4" />
                                    My Listed Items
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="ghost" className="w-full justify-start">
                                    <CircleHelp className="mr-2 h-4 w-4" />
                                    About Us
                                </Button>
                            </Link>
                        </>
                    )}

                    {userRole === "ADMIN" && (
                        <>
                            <Link href="/dashboard/admin">
                                <Button variant="ghost" className="w-full justify-start">
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Moderation Queue
                                </Button>
                            </Link>
                            <Link href="/dashboard/admin/categories">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Tags className="mr-2 h-4 w-4" />
                                    Manage Categories
                                </Button>
                            </Link>
                            <Link href="/dashboard/messages">
                                <Button variant="ghost" className="w-full justify-start">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Inbox
                                </Button>
                            </Link>
                            <Link href="/projects">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Leaf className="mr-2 h-4 w-4" />
                                    Explore Ideas
                                </Button>
                            </Link>
                        </>
                    )}

                    <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </nav>

                <div className="px-4 pb-4 md:mt-auto">
                    <div className="mb-4 flex items-center gap-3 rounded-lg border bg-neutral-50 p-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-neutral-500 capitalize">{userRole.toLowerCase()}</span>
                        </div>
                    </div>
                    <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}