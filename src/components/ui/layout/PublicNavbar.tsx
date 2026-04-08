"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

export default function PublicNavbar() {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { href: "/explore", label: "Explore Ideas" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/newsletter", label: "Updates and News" },
        { href: "/contact", label: "Contact Us" },
        { href: "/faq", label: "Help" },
        { href: "/about", label: "About Us" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Leaf className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        Funding<span className="text-primary">Panda</span>
                    </span>
                </Link>

                {/* Desktop Navigation with Active States */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-sm font-medium transition-colors hover:text-primary ${isActive(item.href) ? "text-primary border-b-2 border-primary py-5" : "text-muted-foreground"}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
                    <ThemeToggle />
                    {isPending ? (
                        <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                    ) : session ? (
                        <ProfileDropdown />
                    ) : (
                        <>
                            <Link href="/login" className="hidden sm:block">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Toggle menu"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {isMobileMenuOpen && (
                <div className="border-t bg-background px-4 pb-4 pt-3 shadow-sm lg:hidden">
                    <nav className="flex flex-col gap-1">
                        {navLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-3 border-t pt-3">
                        {isPending ? (
                            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                        ) : session ? (
                            <div className="mb-2 flex items-center justify-between rounded-lg border border-border/70 bg-card/70 px-3 py-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
                                    <p className="text-sm font-medium text-foreground">Quick Navigation</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                    <ProfileDropdown />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="mb-1 flex justify-end">
                                    <ThemeToggle />
                                </div>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Sign In</Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}