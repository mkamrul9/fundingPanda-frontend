"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, MessageSquare } from "lucide-react";

export default function PublicNavbar() {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Leaf className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-neutral-900">
                        Funding<span className="text-primary">Panda</span>
                    </span>
                </Link>

                {/* Desktop Navigation with Active States */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        href="/"
                        className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary border-b-2 border-primary py-5" : "text-neutral-600"}`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/projects"
                        className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/projects") ? "text-primary border-b-2 border-primary py-5" : "text-neutral-600"}`}
                    >
                        Explore Ideas
                    </Link>
                    <Link
                        href="/about"
                        className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/about") ? "text-primary border-b-2 border-primary py-5" : "text-neutral-600"}`}
                    >
                        About Us
                    </Link>
                    {session && (
                        <Link
                            href="/dashboard/messages"
                            className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/dashboard/messages") ? "text-primary border-b-2 border-primary py-5" : "text-neutral-600"}`}
                        >
                            <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Inbox</div>
                        </Link>
                    )}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {isPending ? (
                        <div className="h-9 w-24 animate-pulse rounded-md bg-neutral-200" />
                    ) : session ? (
                        <Link href="/dashboard">
                            <Button>Dashboard</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost">Log in</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Sign up</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button (Placeholder for now) */}
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </div>
        </header>
    );
}