"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/services/marketing.service";
import { extractApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Twitter, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
    const [email, setEmail] = useState("");

    const subscribeMutation = useMutation({
        mutationFn: (nextEmail: string) => subscribeToNewsletter(nextEmail),
        onSuccess: () => {
            toast.success("Thanks for subscribing! Keep an eye on your inbox.");
            setEmail("");
        },
        onError: (error: unknown) => {
            toast.error(extractApiErrorMessage(error, "Subscription failed. Please try again."));
        },
    });

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        subscribeMutation.mutate(email);
    };

    return (
        <footer className="border-t border-slate-800 bg-slate-900 pb-8 pt-16 text-slate-300">
            <div className="container mx-auto px-4 md:px-8">
                <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <Link href="/" className="mb-4 flex items-center gap-2">
                            <Leaf className="h-6 w-6 text-emerald-500" />
                            <span className="text-xl font-bold tracking-tight text-white">FundingPanda</span>
                        </Link>
                        <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-400">
                            Bridging the gap between brilliant academic research and the industry sponsors who can bring sustainable prototypes to life.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://x.com" target="_blank" rel="noreferrer" className="text-slate-400 transition-colors hover:text-emerald-400"><Twitter className="h-5 w-5" /></a>
                            <a href="https://github.com/mkamrul9" target="_blank" rel="noreferrer" className="text-slate-400 transition-colors hover:text-emerald-400"><Github className="h-5 w-5" /></a>
                            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="text-slate-400 transition-colors hover:text-emerald-400"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-white">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/projects" className="transition-colors hover:text-emerald-400">Explore Ideas</Link></li>
                            <li><Link href="/leaderboard" className="transition-colors hover:text-emerald-400">Top Sponsors</Link></li>
                            <li><Link href="/about" className="transition-colors hover:text-emerald-400">About Us</Link></li>
                            <li><Link href="/newsletter" className="transition-colors hover:text-emerald-400">Updates and News</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-white">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/contact" className="transition-colors hover:text-emerald-400">Contact Us</Link></li>
                            <li><Link href="/faq" className="transition-colors hover:text-emerald-400">Help Center / FAQ</Link></li>
                            <li><Link href="/terms" className="transition-colors hover:text-emerald-400">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="transition-colors hover:text-emerald-400">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-1">
                        <h4 className="mb-4 font-semibold text-white">Stay Updated</h4>
                        <p className="mb-4 text-sm text-slate-400">Get the latest thesis projects delivered to your inbox.</p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-500" disabled={subscribeMutation.isPending}>
                                Subscribe <Mail className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between border-t border-slate-800 pt-8 text-xs text-slate-500 md:flex-row">
                    <p>© {new Date().getFullYear()} FundingPanda Inc. All rights reserved.</p>
                    <div className="mt-4 flex gap-4 md:mt-0">
                        <Link href="/privacy" className="transition-colors hover:text-emerald-400">Privacy</Link>
                        <Link href="/contact" className="transition-colors hover:text-emerald-400">Contact</Link>
                        <Link href="/login" className="transition-colors hover:text-emerald-400">Admin Login</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
