"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { getUserById } from "@/services/user.service";
import { getAllProjects } from "@/services/project.service";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Calendar, MapPin, Leaf, BookOpen } from "lucide-react";

export default function PublicUserProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const { data: user, isLoading: isUserLoading, isError } = useQuery({
    queryKey: ["publicUser", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["userProjects", userId],
    queryFn: () => getAllProjects({ studentId: userId }),
    enabled: !!userId,
  });

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-12 flex flex-col items-center">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </main>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50 items-center justify-center text-center">
        <PublicNavbar />
        <div className="py-24 space-y-4">
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="text-neutral-500">This profile does not exist or has been removed.</p>
          <Link href="/projects"><Button variant="outline">Browse Projects</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicNavbar />

      <main className="container mx-auto px-4 md:px-8 py-12 flex-1">
        <div className="bg-white rounded-2xl p-8 shadow-sm border mb-12 flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-emerald-50 shadow-sm">
            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-900">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-neutral-500 text-sm">
                <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {user.university || "Independent Researcher"}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).getFullYear()}</span>
                <Badge variant="secondary" className="capitalize bg-neutral-100">{user.role.toLowerCase()}</Badge>
              </div>
            </div>

            {user.bio ? (
              <p className="text-neutral-600 max-w-2xl leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-neutral-400 italic">This user hasn't added a bio yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> {user.role === "STUDENT" ? "Published Research" : "Supported Initiatives"}</h2>
          <hr />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isProjectsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden"><Skeleton className="h-48 w-full rounded-none" /><CardHeader><Skeleton className="h-6 w-full" /></CardHeader></Card>
              ))
            ) : projects && projects.length > 0 ? (
              projects.map((project: any) => (
                <Card key={project.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                  <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                    {project.images?.[0] ? (
                      <img src={project.images[0]} alt={project.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-emerald-50 text-emerald-200"><Leaf className="h-16 w-16" /></div>
                    )}
                  </div>
                  <CardHeader className="pb-4">
                    <h3 className="line-clamp-2 text-lg font-bold">{project.title}</h3>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="line-clamp-3 text-sm text-neutral-500">{project.description}</p>
                  </CardContent>
                  <CardFooter className="border-t bg-neutral-50/50 p-4">
                    <Link href={`/projects/${project.id}`} className="w-full"><Button className="w-full" variant="outline">View Idea</Button></Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-neutral-500 bg-white rounded-xl border border-dashed">This user currently has no public projects.</div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
