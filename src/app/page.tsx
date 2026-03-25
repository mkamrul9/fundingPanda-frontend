"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicProjects } from "@/services/project.service";
import PublicNavbar from "../components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Leaf, UserRound, HandCoins, CheckCircle2, ShieldCheck, Zap, Handshake, LineChart, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const FEATURED_PROJECT_LIMIT = 6;
  const testimonials = [
    {
      role: "Student",
      quote: "FundingPanda helped me raise prototype funds in less than two weeks after approval.",
      name: "Ayesha",
      title: "Mechanical Engineering",
      image: "https://i.pravatar.cc/120?img=32",
      accent: "bg-emerald-100 text-emerald-700",
      check: "text-emerald-600",
    },
    {
      role: "Sponsor",
      quote: "The platform makes it easy to discover credible student work and directly support outcomes.",
      name: "Rahim",
      title: "Sustainability Investor",
      image: "https://i.pravatar.cc/120?img=15",
      accent: "bg-blue-100 text-blue-700",
      check: "text-blue-600",
    },
    {
      role: "Student",
      quote: "I listed progress updates and connected with a sponsor mentor through messages.",
      name: "Nabila",
      title: "Civil Engineering",
      image: "https://i.pravatar.cc/120?img=48",
      accent: "bg-emerald-100 text-emerald-700",
      check: "text-emerald-600",
    },
    {
      role: "Sponsor",
      quote: "I could quickly support teams building real prototypes and track progress clearly.",
      name: "Karim",
      title: "Tech Sponsor",
      image: "https://i.pravatar.cc/120?img=12",
      accent: "bg-blue-100 text-blue-700",
      check: "text-blue-600",
    },
    {
      role: "Student",
      quote: "The review workflow helped me improve my pitch before public launch and fundraising.",
      name: "Mina",
      title: "Energy Systems",
      image: "https://i.pravatar.cc/120?img=25",
      accent: "bg-emerald-100 text-emerald-700",
      check: "text-emerald-600",
    },
    {
      role: "Sponsor",
      quote: "I can track exactly where my support goes and which projects were completed successfully.",
      name: "Fahim",
      title: "Impact Partner",
      image: "https://i.pravatar.cc/120?img=58",
      accent: "bg-blue-100 text-blue-700",
      check: "text-blue-600",
    },
  ];

  const { data: projects, isLoading } = useQuery({
    queryKey: ["publicProjects"],
    queryFn: getPublicProjects,
  });

  const featuredProjects = (projects ?? []).slice(0, FEATURED_PROJECT_LIMIT);
  const [slideIndex, setSlideIndex] = useState(0);
  const visibleFeatured = useMemo(() => {
    if (featuredProjects.length <= 3) return featuredProjects;
    return Array.from({ length: 3 }).map((_, offset) => {
      const index = (slideIndex + offset) % featuredProjects.length;
      return featuredProjects[index];
    });
  }, [featuredProjects, slideIndex]);

  const showNext = () => {
    if (featuredProjects.length <= 3) return;
    setSlideIndex((prev) => (prev + 1) % featuredProjects.length);
  };

  const showPrev = () => {
    if (featuredProjects.length <= 3) return;
    setSlideIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
  };

  const scrollingTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
          {/* Background overlay */}
          <div className="absolute inset-0 z-0 bg-linear-to-br from-primary/40 to-slate-900/90" />

          <div className="container relative z-10 mx-auto px-4 text-center md:px-8">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-emerald-300 hover:bg-white/20">
              Empowering Student Research
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Turn sustainable ideas into <span className="text-emerald-400">reality.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
              Join the premier community connecting brilliant academic minds with industry sponsors. Fund hardware prototypes, launch solar projects, and build a greener future.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/projects">
                <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
                  Explore Ideas
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto bg-transparent text-white border-slate-600 hover:bg-slate-800 hover:text-white">
                  Start a Project
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED IDEAS SECTION */}
        <section className="container mx-auto py-20 px-4 md:px-8">
          <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Featured Ideas</h2>
              <p className="text-neutral-500 mt-2">Discover groundbreaking sustainability projects waiting for your support. Showing {FEATURED_PROJECT_LIMIT} featured projects.</p>
            </div>
            <Link href="/projects">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                View all ideas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div>
            {isLoading ? (
              // Loading Skeletons
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full rounded-none" />
                    <CardHeader className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></CardHeader>
                    <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredProjects.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={showPrev} disabled={featuredProjects.length <= 3}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={showNext} disabled={featuredProjects.length <= 3}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleFeatured.map((project: any) => (
                    <div key={project.id} className="transition-all duration-300">
                      <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
                        <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                          {project.images?.[0] ? (
                            <img src={project.images[0]} alt={project.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-emerald-50 text-emerald-200">
                              <Leaf className="h-16 w-16" />
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="secondary" className="bg-primary/10 text-xs font-medium text-primary">
                              {project.categories?.[0]?.name || "Sustainability"}
                            </Badge>
                          </div>
                          <h3 className="line-clamp-2 text-xl font-bold">{project.title}</h3>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="whitespace-pre-wrap wrap-break-word text-sm text-neutral-500">{project.description}</p>
                        </CardContent>
                        <CardFooter className="border-t bg-neutral-50/50 p-4">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs text-neutral-500">Raised</span>
                              <span className="font-semibold text-primary">${project.raisedAmount} / ${project.goalAmount}</span>
                            </div>
                            <Link href={`/projects/${project.id}`}>
                              <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">View Details</Button>
                            </Link>
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-neutral-500">
                No approved projects found. Be the first to submit an idea!
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">How This Works</h2>
              <p className="mx-auto mt-2 max-w-2xl text-neutral-500">
                A complete step-by-step path, from account setup to measurable impact.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-emerald-200">
                <CardHeader>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><UserRound className="h-5 w-5 text-emerald-600" /> Student Flow</h3>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg border bg-emerald-50 p-3 font-medium text-emerald-900">1. Complete profile with university, bio, and focus area</div>
                  <div className="text-xs text-neutral-500">This helps sponsors understand your background quickly.</div>
                  <div className="text-center text-neutral-400">↓</div>
                  <div className="rounded-lg border bg-emerald-50 p-3 font-medium text-emerald-900">2. Create project draft and upload pitch PDF + prototype images</div>
                  <div className="text-xs text-neutral-500">Draft first, refine details, then submit for review when ready.</div>
                  <div className="text-center text-neutral-400">↓</div>
                  <div className="rounded-lg border bg-emerald-50 p-3 font-medium text-emerald-900">3. Admin reviews and approves project for public visibility</div>
                  <div className="text-xs text-neutral-500">Approved projects become visible to sponsors and can receive funding.</div>
                  <div className="text-center text-neutral-400">↓</div>
                  <div className="rounded-lg border bg-emerald-50 p-3 font-medium text-emerald-900">4. Use resources, chat with sponsors, post updates, and complete delivery</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><HandCoins className="h-5 w-5 text-blue-600" /> Sponsor Flow</h3>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg border bg-blue-50 p-3 font-medium text-blue-900">1. Join as sponsor and define impact interests</div>
                  <div className="text-xs text-neutral-500">Filter projects by category, purpose, and funding progress.</div>
                  <div className="text-center text-neutral-400">↓</div>
                  <div className="rounded-lg border bg-blue-50 p-3 font-medium text-blue-900">2. Explore approved projects and review student profiles</div>
                  <div className="text-xs text-neutral-500">Assess project quality before donating or offering resources.</div>
                  <div className="text-center text-neutral-400">↓</div>
                  <div className="rounded-lg border bg-blue-50 p-3 font-medium text-blue-900">3. Fund with Stripe and support execution through dashboard tools</div>
                  <div className="text-xs text-neutral-500">Your support is tracked in your dashboard and global ledger.</div>
                  <div className="text-center text-neutral-400">↓</div>
                  <div className="rounded-lg border bg-blue-50 p-3 font-medium text-blue-900">4. Track outcomes and recognition via leaderboard and updates</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Why Choose Us?</h2>
            <p className="mx-auto mt-2 max-w-2xl text-neutral-500">A focused platform built specifically for research-backed impact projects.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="space-y-3 p-6">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
                <h3 className="font-bold text-neutral-900">Verified Workflows</h3>
                <p className="text-sm text-neutral-600">Projects pass moderation before becoming publicly fundable.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <Zap className="h-7 w-7 text-amber-500" />
                <h3 className="font-bold text-neutral-900">Fast Sponsorship Match</h3>
                <p className="text-sm text-neutral-600">Sponsors quickly discover relevant opportunities through filters and profiles.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <Handshake className="h-7 w-7 text-blue-600" />
                <h3 className="font-bold text-neutral-900">Beyond Funding</h3>
                <p className="text-sm text-neutral-600">Resource sharing and messaging help students execute, not just raise money.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <LineChart className="h-7 w-7 text-primary" />
                <h3 className="font-bold text-neutral-900">Transparent Impact</h3>
                <p className="text-sm text-neutral-600">Track donations, progress, and completion outcomes from one ecosystem.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Voices From Our Community</h2>
            <p className="mx-auto mt-2 max-w-2xl text-neutral-500">Feedback from students and sponsors using FundingPanda.</p>
          </div>

          <div className="marquee-shell">
            <div className="marquee-track marquee-track-slow">
              {scrollingTestimonials.map((item, index) => (
                <div key={`${item.name}-${index}`} className="marquee-item">
                  <Card>
                    <CardContent className="space-y-4 p-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={item.image} alt={item.name} />
                          <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">{item.title}</p>
                        </div>
                      </div>
                      <Badge className={`w-fit ${item.accent}`}>{item.role}</Badge>
                      <p className="text-sm text-neutral-700">{item.quote}</p>
                      <p className="flex items-center gap-2 text-xs text-neutral-500"><CheckCircle2 className={`h-4 w-4 ${item.check}`} /> Verified community feedback</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
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

        .marquee-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          will-change: transform;
          animation-name: fp-marquee-left;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .marquee-track-fast {
          animation-duration: 34s;
        }

        .marquee-track-slow {
          animation-duration: 38s;
        }

        .marquee-item {
          width: calc((100vw - 10rem) / 3);
          min-width: 270px;
          max-width: 420px;
          flex: 0 0 auto;
        }

        @media (max-width: 1024px) {
          .marquee-item {
            width: 320px;
          }
        }

        @keyframes fp-marquee-left {
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