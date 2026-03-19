"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getPublicProjects } from "@/services/project.service";
import PublicNavbar from "../components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowRight, Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["publicProjects"],
    queryFn: getPublicProjects,
  });

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
              <p className="text-neutral-500 mt-2">Discover groundbreaking sustainability projects waiting for your support.</p>
            </div>
            <Link href="/projects">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                View all ideas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // Loading Skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <CardHeader className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></CardHeader>
                  <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                </Card>
              ))
            ) : projects && projects.length > 0 ? (
              projects.map((project: any) => (
                <Card key={project.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                    {/* Fallback pattern if no images exist */}
                    {project.images?.[0] ? (
                      <img src={project.images[0]} alt={project.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-emerald-50 text-emerald-200">
                        <Leaf className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs font-medium text-primary bg-primary/10">
                        {project.categories?.[0]?.name || "Sustainability"}
                      </Badge>
                    </div>
                    <h3 className="line-clamp-2 text-xl font-bold">{project.title}</h3>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="line-clamp-3 text-sm text-neutral-500">{project.description}</p>
                  </CardContent>
                  <CardFooter className="border-t bg-neutral-50/50 p-4">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-500">Raised</span>
                        <span className="font-semibold text-primary">${project.raisedAmount} / ${project.goalAmount}</span>
                      </div>
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-neutral-500">
                No approved projects found. Be the first to submit an idea!
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}