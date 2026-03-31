"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { subscribeToNewsletter } from "@/services/marketing.service";
import { extractApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Zap, Globe, Newspaper, CalendarDays, ArrowRight } from "lucide-react";

export default function NewsletterPage() {
    const [email, setEmail] = useState("");

    const subscribeMutation = useMutation({
        mutationFn: subscribeToNewsletter,
        onSuccess: () => {
            toast.success("Subscribed successfully!");
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

    const updates = [
        {
            title: "Platform Update v1.8",
            category: "Product",
            summary: "Improved sponsor leaderboard analytics and faster project discovery filters.",
        },
        {
            title: "How To Write a Fundable Thesis Pitch",
            category: "Guide",
            summary: "A practical framework students can use to improve approval and funding chances.",
        },
        {
            title: "FundingPanda Impact Report - March",
            category: "Impact",
            summary: "Completed projects, total sponsored amount, and top-performing research categories.",
        },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />

            <main className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-20">
                <section className="mb-16 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                        <Mail className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h1 className="mb-6 text-4xl font-extrabold text-neutral-900 md:text-5xl">
                        Updates and News, <span className="text-primary">straight to your inbox.</span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-xl text-neutral-600">
                        Join sponsors and researchers getting weekly project highlights, platform improvements, and impact stories from FundingPanda.
                    </p>

                    <form onSubmit={handleSubscribe} className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row">
                        <Input
                            type="email"
                            placeholder="Enter your email address..."
                            className="h-12 flex-1 text-base"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" size="lg" className="h-12 w-full px-8 sm:w-auto" disabled={subscribeMutation.isPending}>
                            {subscribeMutation.isPending ? "Joining..." : "Subscribe"}
                        </Button>
                    </form>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-neutral-900">
                            <Newspaper className="h-5 w-5 text-primary" /> What You Will Receive
                        </h2>
                        <ul className="grid gap-3 text-sm text-neutral-600 md:grid-cols-2">
                            <li>Weekly spotlight on new approved research projects</li>
                            <li>Monthly platform metrics and impact report</li>
                            <li>Funding trends and top-performing categories</li>
                            <li>Feature updates and roadmap announcements</li>
                        </ul>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-neutral-900">
                            <CalendarDays className="h-5 w-5 text-primary" /> Platform Blogs and News
                        </h2>
                        <div className="space-y-3">
                            {updates.map((item) => (
                                <div key={item.title} className="rounded-lg border bg-neutral-50 p-4">
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{item.category}</div>
                                    <h3 className="mb-1 font-semibold text-neutral-900">{item.title}</h3>
                                    <p className="text-sm text-neutral-600">{item.summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-14">
                    <div className="mb-4 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold text-neutral-900">Latest Bulletin Preview</h3>
                    </div>

                    <div className="mt-4 grid gap-8 md:grid-cols-2">
                        <Card className="border-0 bg-white shadow-md">
                            <CardContent className="space-y-4 p-8">
                                <Zap className="h-8 w-8 text-amber-500" />
                                <h3 className="text-xl font-bold">This Week: Top 5 New Prototypes</h3>
                                <p className="text-neutral-600">See the newest climate-tech and healthcare prototypes recently approved for sponsorship.</p>
                                <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">Read bulletin <ArrowRight className="h-4 w-4" /></div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-white shadow-md">
                            <CardContent className="space-y-4 p-8">
                                <Globe className="h-8 w-8 text-blue-500" />
                                <h3 className="text-xl font-bold">Monthly Impact Snapshot</h3>
                                <p className="text-neutral-600">Track completed projects, sponsor activity, and platform growth in one concise update.</p>
                                <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">View report <ArrowRight className="h-4 w-4" /></div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    );
}
