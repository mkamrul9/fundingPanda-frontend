"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories, getPublicProjects } from "@/services/project.service";
import { subscribeToNewsletter } from "@/services/marketing.service";
import { extractApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    ChevronDown,
    Compass,
    Globe,
    HeartHandshake,
    Leaf,
    Lightbulb,
    Rocket,
    ShieldCheck,
    Users,
} from "lucide-react";

type Project = {
    id: string;
    title: string;
    description: string;
    images?: string[];
    raisedAmount: number;
    goalAmount: number;
    categories?: Array<{ id: string; name: string }>;
};

type Category = {
    id: string;
    name: string;
    description?: string;
};

const testimonials = [
    {
        initials: "SJ",
        image: "https://i.pravatar.cc/120?img=32",
        name: "Sarah Jenkins",
        role: "Engineering Student",
        quote:
            "FundingPanda connected me to a sponsor in 5 days. My prototype finally moved from slides to a working demo.",
    },
    {
        initials: "MC",
        image: "https://i.pravatar.cc/120?img=15",
        name: "Marcus Chen",
        role: "CTO, Nexus Corp",
        quote:
            "We discovered two exceptional students through their project updates and hired both after completion.",
    },
    {
        initials: "AR",
        image: "https://i.pravatar.cc/120?img=22",
        name: "Arefin Rahman",
        role: "IoT Researcher",
        quote:
            "The moderation flow improved my pitch quality, and sponsors trusted the final version immediately.",
    },
    {
        initials: "LN",
        image: "https://i.pravatar.cc/120?img=48",
        name: "Lamia Noor",
        role: "Clean Energy Student",
        quote:
            "The resource claim system saved us a lot of money on hardware. We finished one month earlier.",
    },
    {
        initials: "DK",
        image: "https://i.pravatar.cc/120?img=11",
        name: "David Kim",
        role: "Impact Sponsor",
        quote:
            "Donation tracking and timeline milestones gave me confidence that every dollar was used responsibly.",
    },
    {
        initials: "TS",
        image: "https://i.pravatar.cc/120?img=56",
        name: "Tasnia Sultana",
        role: "Biotech Student",
        quote:
            "PandaBot and the FAQ helped us onboard quickly. The platform feels built for real project execution.",
    },
];

const trustedResearchers = [
    "STANFORD",
    "TechCorp",
    "MIT.edu",
    "GlobalVentures",
    "EcoInnovate",
    "Caltech Lab",
    "Imperial R&D",
    "NUS Innovation",
    "Oxford FutureTech",
    "CleanGrid Labs",
];

export default function HomePage() {
    const [newsletterEmail, setNewsletterEmail] = useState("");

    const newsletterMutation = useMutation({
        mutationFn: (email: string) => subscribeToNewsletter(email),
        onSuccess: () => {
            toast.success("Thanks for subscribing. Weekly updates are on the way.");
            setNewsletterEmail("");
        },
        onError: (error: unknown) => {
            toast.error(extractApiErrorMessage(error, "Subscription failed. Please try again."));
        },
    });

    const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = newsletterEmail.trim();
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        newsletterMutation.mutate(email);
    };

    const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
        queryKey: ["publicProjects", "home"],
        queryFn: getPublicProjects,
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
        queryKey: ["categories", "home"],
        queryFn: getCategories,
    });

    const trendingProjects = useMemo(() => {
        const sorted = [...projects].sort((a, b) => {
            const ratioA = a.goalAmount > 0 ? a.raisedAmount / a.goalAmount : 0;
            const ratioB = b.goalAmount > 0 ? b.raisedAmount / b.goalAmount : 0;
            if (ratioB !== ratioA) return ratioB - ratioA;
            return b.raisedAmount - a.raisedAmount;
        });
        return sorted.slice(0, 4);
    }, [projects]);

    const visibleCategories = categories.slice(0, 8);
    const hiddenCategories = categories.slice(8);
    const scrollingTestimonials = [...testimonials, ...testimonials];
    const scrollingTrusted = [...trustedResearchers, ...trustedResearchers];

    return (
        <div className="flex min-h-screen flex-col bg-transparent text-foreground">
            <PublicNavbar />

            <main className="flex-1">
                {/* SECTION 1: HERO */}
                <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-linear-to-br from-emerald-200/85 via-background to-cyan-100/80 px-4 py-24 text-center dark:from-emerald-950 dark:via-slate-950 dark:to-cyan-950/60">
                    <div className="absolute -left-32 top-12 -z-10 h-80 w-80 rounded-full bg-emerald-300/35 blur-3xl dark:bg-emerald-700/25" />
                    <div className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-teal-300/35 opacity-40 blur-3xl animate-pulse dark:bg-teal-700/25" />
                    <div className="absolute bottom-[-120px] left-1/2 -z-10 h-72 w-[68rem] -translate-x-1/2 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-700/20" />

                    <Badge className="mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300">
                        Over $2M in Academic Funding Raised
                    </Badge>
                    <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl">
                        Bridge the Gap Between <span className="text-emerald-600 dark:text-emerald-500">Research &amp; Reality</span>
                    </h1>
                    <p className="mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                        FundingPanda connects brilliant university students with industry sponsors to fund, build, and launch sustainable hardware and software prototypes.
                    </p>
                    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                        <Link href="/projects">
                            <Button size="lg" className="h-14 w-full gap-2 px-8 text-lg shadow-lg ring-2 ring-primary/20 sm:w-auto">
                                Explore Ideas <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="secondary" className="h-14 w-full px-8 text-lg font-bold shadow-lg ring-2 ring-white/25 sm:w-auto">
                                Submit Idea
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* SECTION 2: TRUSTED BY */}
                <section className="app-panel border-y py-12">
                    <div className="container mx-auto px-4 text-center">
                        <p className="mb-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trusted by Researchers &amp; Sponsors from</p>
                        <div className="trusted-shell">
                            <div className="trusted-track">
                                {scrollingTrusted.map((brand, index) => (
                                    <div key={`${brand}-${index}`} className="trusted-item">
                                        {brand}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: HOW IT WORKS */}
                <section className="bg-linear-to-b from-emerald-100/70 via-background to-cyan-50/45 py-24 dark:from-emerald-950/22 dark:to-background">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold">How FundingPanda Works</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">A transparent, three-step process to take ideas out of the lab and into the real world.</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    icon: Lightbulb,
                                    title: "1. Pitch the Idea",
                                    desc: "Students submit their project designs, detailing the problem, solution, and required funding.",
                                },
                                {
                                    icon: HeartHandshake,
                                    title: "2. Secure Funding",
                                    desc: "Industry sponsors review approved projects and donate cash or physical resources.",
                                },
                                {
                                    icon: Rocket,
                                    title: "3. Build & Review",
                                    desc: "Students post timeline updates. Sponsors review projects after successful completion.",
                                },
                            ].map((step) => (
                                <Card key={step.title} className="app-card border-0 text-card-foreground">
                                    <CardContent className="pt-8 text-center">
                                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50">
                                            <step.icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 4: IMPACT STATISTICS */}
                <section className="bg-slate-900 py-20 text-white dark:bg-slate-950">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                            <div>
                                <h4 className="mb-2 text-4xl font-black text-emerald-400 md:text-5xl">$2.4M</h4>
                                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Total Funded</p>
                            </div>
                            <div>
                                <h4 className="mb-2 text-4xl font-black text-emerald-400 md:text-5xl">842</h4>
                                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Projects Completed</p>
                            </div>
                            <div>
                                <h4 className="mb-2 text-4xl font-black text-emerald-400 md:text-5xl">150+</h4>
                                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Universities</p>
                            </div>
                            <div>
                                <h4 className="mb-2 text-4xl font-black text-emerald-400 md:text-5xl">4.9/5</h4>
                                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Average Review</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: TRENDING PROJECTS */}
                <section className="bg-linear-to-b from-transparent via-emerald-100/45 to-cyan-50/50 py-24 dark:via-emerald-950/18 dark:to-cyan-950/10">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 flex items-end justify-between">
                            <div>
                                <h2 className="mb-2 text-3xl font-bold">Trending Projects</h2>
                                <p className="text-muted-foreground">Top-performing approved projects based on progress and momentum.</p>
                            </div>
                            <Link href="/projects" className="hidden font-semibold text-emerald-600 hover:underline sm:block dark:text-emerald-400">
                                View All →
                            </Link>
                        </div>

                        {projectsLoading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <Card key={idx} className="overflow-hidden">
                                        <Skeleton className="h-48 w-full rounded-none" />
                                        <CardHeader>
                                            <Skeleton className="h-5 w-3/4" />
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-2 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : trendingProjects.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {trendingProjects.map((project) => {
                                    const goal = project.goalAmount || 1;
                                    const progress = Math.min(100, Math.round((project.raisedAmount / goal) * 100));
                                    return (
                                        <Card key={project.id} className="app-card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-xl">
                                            <div className="relative h-48 overflow-hidden bg-muted">
                                                {project.images?.[0] ? (
                                                    <div
                                                        role="img"
                                                        aria-label={project.title}
                                                        className="h-full w-full bg-cover bg-center"
                                                        style={{ backgroundImage: `url(${project.images[0]})` }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-emerald-50 text-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400/40">
                                                        <Leaf className="h-14 w-14" />
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader>
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                                                        {project.categories?.[0]?.name || "Innovation"}
                                                    </Badge>
                                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{progress}% funded</span>
                                                </div>
                                                <CardTitle className="line-clamp-2 text-lg">{project.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex flex-1 flex-col">
                                                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                                                <div className="mb-2 h-2 rounded-full bg-secondary">
                                                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">${project.raisedAmount.toLocaleString()} raised</span>
                                                    <span className="text-muted-foreground">Goal ${project.goalAmount.toLocaleString()}</span>
                                                </div>
                                                <Link href={`/projects/${project.id}`} className="mt-auto pt-4">
                                                    <Button className="w-full">View Details</Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed bg-card p-12 text-center text-muted-foreground">
                                No approved projects available right now.
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 6: EXPLORE BY CATEGORY */}
                <section className="bg-linear-to-b from-cyan-50/35 via-transparent to-emerald-50/30 py-20 dark:from-cyan-950/12 dark:to-emerald-950/10">
                    <div className="container mx-auto px-4">
                        <h2 className="mb-3 text-center text-3xl font-bold">Explore by Category</h2>
                        <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
                            Categories are managed by admins and update automatically here.
                        </p>

                        {categoriesLoading ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <Skeleton key={idx} className="h-20 rounded-xl" />
                                ))}
                            </div>
                        ) : categories.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {visibleCategories.map((cat) => (
                                        <Link key={cat.id} href={`/projects?categoryId=${cat.id}`}>
                                            <Button variant="outline" className="h-20 w-full justify-start text-left hover:border-emerald-500">
                                                <span className="line-clamp-2 font-semibold">{cat.name}</span>
                                            </Button>
                                        </Link>
                                    ))}
                                </div>

                                {hiddenCategories.length > 0 && (
                                    <details className="mt-4 rounded-xl border bg-card p-4">
                                        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                                            See more categories
                                            <ChevronDown className="h-4 w-4" />
                                        </summary>
                                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                            {hiddenCategories.map((cat) => (
                                                <Link key={cat.id} href={`/projects?categoryId=${cat.id}`}>
                                                    <Button variant="ghost" className="h-14 w-full justify-start rounded-lg border">
                                                        <span className="line-clamp-2">{cat.name}</span>
                                                    </Button>
                                                </Link>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </>
                        ) : (
                            <div className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
                                No categories found yet.
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 7: STORIES OF SUCCESS (MARQUEE RIGHT TO LEFT) */}
                <section className="bg-linear-to-b from-transparent via-teal-100/45 to-cyan-50/35 py-24 dark:via-teal-950/18 dark:to-cyan-950/10">
                    <div className="container mx-auto px-4">
                        <h2 className="mb-4 text-center text-3xl font-bold">Stories of Success</h2>
                        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
                            Real voices from students and sponsors using FundingPanda.
                        </p>

                        <div className="marquee-shell">
                            <div className="marquee-track">
                                {scrollingTestimonials.map((item, idx) => (
                                    <Card key={`${item.initials}-${idx}`} className="marquee-item">
                                        <CardContent className="pt-6">
                                            <div className="mb-4 flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={item.image} alt={item.name} />
                                                    <AvatarFallback>{item.initials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.role}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm italic text-muted-foreground">&quot;{item.quote}&quot;</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 8: COMMON QUESTIONS */}
                <section className="bg-muted/30 py-20">
                    <div className="container mx-auto max-w-3xl px-4">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold">Common Questions</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full rounded-xl border bg-background p-4 shadow-sm">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="font-semibold">Does FundingPanda take a cut?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">We charge a flat 5% platform fee on successful cash donations. Resource claims are free.</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="font-semibold">Who owns the intellectual property?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">The student retains full IP ownership unless they sign a separate legal agreement outside the platform.</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="font-semibold">How are students verified?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">Students register with valid academic identity and projects go through moderation before public listing.</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger className="font-semibold">Can sponsors message students directly?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">Yes. Real-time chat is available for approved project collaboration and follow-up questions.</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5">
                                <AccordionTrigger className="font-semibold">What is the minimum donation amount?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">The minimum amount is $5, processed securely via Stripe.</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-6">
                                <AccordionTrigger className="font-semibold">When can reviews be submitted?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">Sponsors can submit reviews after a project is marked as completed and outcomes are posted.</AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </section>

                {/* SECTION 9: NEWSLETTER */}
                <section className="bg-linear-to-b from-emerald-50/70 to-background py-16 dark:from-emerald-950/22 dark:to-background">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-emerald-600 p-8 text-white shadow-2xl dark:bg-emerald-800 md:flex-row md:p-12">
                            <div className="max-w-xl text-left">
                                <h3 className="mb-2 text-3xl font-bold">Join the Innovation Newsletter</h3>
                                <p className="text-emerald-100">Get a weekly digest of the top 5 most promising projects actively seeking sponsors.</p>
                            </div>
                            <form onSubmit={handleNewsletterSubmit} className="flex w-full gap-2 md:w-auto">
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="h-12 w-full rounded-lg border border-white/50 bg-white px-4 text-neutral-900 placeholder:text-neutral-500 shadow-sm outline-none ring-0 focus:border-white md:w-72"
                                    disabled={newsletterMutation.isPending}
                                />
                                <Button type="submit" variant="secondary" className="h-12 shrink-0 font-bold" disabled={newsletterMutation.isPending}>
                                    {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* SECTION 10: CTA */}
                <section className="bg-linear-to-b from-background via-emerald-50/40 to-background py-24 text-center dark:via-emerald-950/15">
                    <ShieldCheck className="mx-auto mb-6 h-16 w-16 text-emerald-500" />
                    <h2 className="mb-6 text-4xl font-extrabold tracking-tight">Ready to build the future?</h2>
                    <p className="mb-10 text-xl text-muted-foreground">Join students and sponsors making meaningful innovation happen.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="h-14 px-8 text-lg shadow-lg ring-2 ring-primary/20">Submit Idea</Button>
                        </Link>
                        <Link href="/about">
                            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold shadow-lg ring-2 ring-primary/15">Learn Now</Button>
                        </Link>
                    </div>
                </section>

                {/* SECTION 11: APP FLOW (STUDENT) */}
                <section className="border-y bg-muted/20 py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="mb-4 text-center text-3xl font-bold">Student App Flow</h2>
                        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">How to use the platform from account setup to project completion.</p>
                        <div className="grid gap-6 md:grid-cols-4">
                            {[
                                { icon: Users, title: "Profile Setup", desc: "Create account, add university, skills, and project interests." },
                                { icon: Lightbulb, title: "Create Project", desc: "Add title, goal, media, and clear problem statement." },
                                { icon: Compass, title: "Get Approved", desc: "Pass admin moderation and publish your project publicly." },
                                { icon: Rocket, title: "Deliver Outcome", desc: "Post updates, complete milestones, and close with results." },
                            ].map((item) => (
                                <Card key={item.title}>
                                    <CardContent className="pt-6">
                                        <item.icon className="mb-3 h-7 w-7 text-primary" />
                                        <h3 className="mb-2 font-semibold">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 12: APP FLOW (SPONSOR) */}
                <section className="bg-linear-to-b from-teal-50/55 to-background py-20 dark:from-teal-950/15 dark:to-background">
                    <div className="container mx-auto px-4">
                        <h2 className="mb-4 text-center text-3xl font-bold">Sponsor App Flow</h2>
                        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">How sponsors discover, evaluate, fund, and track projects.</p>
                        <div className="grid gap-6 md:grid-cols-4">
                            {[
                                { icon: Globe, title: "Browse", desc: "Explore projects by category, funding status, and student profile." },
                                { icon: ShieldCheck, title: "Evaluate", desc: "Review approved projects with documentation and updates." },
                                { icon: HeartHandshake, title: "Fund", desc: "Donate securely with Stripe and optional resource support." },
                                { icon: CheckCircle2, title: "Review", desc: "Track outcomes and submit public completion reviews." },
                            ].map((item) => (
                                <Card key={item.title}>
                                    <CardContent className="pt-6">
                                        <item.icon className="mb-3 h-7 w-7 text-primary" />
                                        <h3 className="mb-2 font-semibold">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 13: PANDA SUPPORT */}
                <section className="pb-24">
                    <div className="container mx-auto px-4">
                        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
                            <Bot className="mx-auto mb-4 h-10 w-10 text-primary" />
                            <h3 className="mb-2 text-2xl font-bold">Need guidance while exploring?</h3>
                            <p className="text-muted-foreground">
                                Use the PandaBot in the bottom-right corner. If you are lost, reach me.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <style jsx>{`
        .marquee-shell {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%);
        }

                .trusted-shell {
                    overflow: hidden;
                    width: 100%;
                    mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%);
                }

                .trusted-track {
                    display: flex;
                    gap: 1.5rem;
                    width: max-content;
                    will-change: transform;
                    animation: fp-trusted-rtl 34s linear infinite;
                }

                .trusted-item {
                    flex: 0 0 auto;
                    border: 1px solid color-mix(in srgb, var(--color-border, var(--border)) 75%, transparent);
                    background: color-mix(in srgb, var(--color-card, var(--card)) 88%, transparent);
                    border-radius: 999px;
                    padding: 0.625rem 1rem;
                    font-size: 0.875rem;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    color: var(--color-muted-foreground, var(--muted-foreground));
                    text-transform: uppercase;
                }

        .marquee-track {
          display: flex;
          gap: 1.25rem;
          width: max-content;
          will-change: transform;
          animation: fp-marquee-rtl 42s linear infinite;
        }

        .marquee-item {
          width: min(360px, 82vw);
          flex: 0 0 auto;
        }

        @keyframes fp-marquee-rtl {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.625rem));
          }
        }

                @keyframes fp-trusted-rtl {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(calc(-50% - 0.75rem));
                    }
                }
      `}</style>
        </div>
    );
}
