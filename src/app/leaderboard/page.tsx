"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getTopSponsors } from "@/services/user.service";
import { getAllProjects } from "@/services/project.service";
import { getUserReviews } from "@/services/review.service";

import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Heart, GraduationCap, Star } from "lucide-react";

type TopSponsor = {
    id: string;
    name: string;
    totalFunded?: number;
    totalDonated?: number;
    supportCount?: number;
    _count?: {
        donations?: number;
    };
};

type ProjectForRanking = {
    id: string;
    title: string;
    raisedAmount?: number;
    studentId?: string;
    student?: {
        name?: string;
        university?: string;
    };
};

type RankedStudent = {
    id: string;
    name: string;
    university: string;
    totalRaised: number;
    averageRating: number;
    totalReviews: number;
    projectCount: number;
};

export default function LeaderboardPage() {
    const [sponsorPage, setSponsorPage] = useState(1);
    const [studentPage, setStudentPage] = useState(1);
    const PAGE_SIZE = 5;

    const { data: topSponsors, isLoading } = useQuery({
        queryKey: ["topSponsors"],
        queryFn: getTopSponsors,
    });

    const { data: topStudents, isLoading: isStudentsLoading } = useQuery({
        queryKey: ["topStudentsLeaderboard"],
        queryFn: async () => {
            const projects = (await getAllProjects({ limit: 200, sortBy: "-raisedAmount" })) as ProjectForRanking[];

            const studentMap = new Map<string, RankedStudent>();

            projects.forEach((project) => {
                if (!project.studentId) return;

                const existing = studentMap.get(project.studentId);
                const raised = Number(project.raisedAmount || 0);

                if (existing) {
                    existing.totalRaised += raised;
                    existing.projectCount += 1;
                    return;
                }

                studentMap.set(project.studentId, {
                    id: project.studentId,
                    name: project.student?.name || "Student",
                    university: project.student?.university || "Independent Researcher",
                    totalRaised: raised,
                    averageRating: 0,
                    totalReviews: 0,
                    projectCount: 1,
                });
            });

            const students = Array.from(studentMap.values());
            const withReviews = await Promise.all(
                students.map(async (student) => {
                    try {
                        const reviews = await getUserReviews(student.id);
                        return {
                            ...student,
                            averageRating: Number(reviews?.averageRating || 0),
                            totalReviews: Number(reviews?.totalReviews || 0),
                        };
                    } catch {
                        return student;
                    }
                })
            );

            // Ranking priority: total raised, then average rating, then number of reviews.
            return withReviews
                .sort((a, b) => {
                    if (b.totalRaised !== a.totalRaised) return b.totalRaised - a.totalRaised;
                    if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
                    return b.totalReviews - a.totalReviews;
                })
                .slice(0, 10);
        },
    });

    const getRankBadge = (index: number) => {
        if (index === 0) return <Medal className="h-8 w-8 text-yellow-500 drop-shadow-md" />;
        if (index === 1) return <Medal className="h-8 w-8 text-slate-400 drop-shadow-md" />;
        if (index === 2) return <Medal className="h-8 w-8 text-amber-700 drop-shadow-md" />;
        return <span className="w-8 text-center text-xl font-bold text-neutral-400">#{index + 1}</span>;
    };

    const sponsorList = (topSponsors ?? []) as TopSponsor[];
    const pagedSponsors = sponsorList.slice((sponsorPage - 1) * PAGE_SIZE, sponsorPage * PAGE_SIZE);
    const sponsorPages = Math.max(1, Math.ceil(sponsorList.length / PAGE_SIZE));

    const studentList = topStudents ?? [];
    const pagedStudents = studentList.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE);
    const studentPages = Math.max(1, Math.ceil(studentList.length / PAGE_SIZE));

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />

            <main className="container mx-auto flex max-w-4xl flex-1 flex-col px-4 py-12">
                <div className="mb-12 animate-in slide-in-from-bottom-4 fade-in text-center duration-500">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                        <Trophy className="h-10 w-10 text-amber-600" />
                    </div>
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-900">
                        Wall of <span className="text-primary">Impact</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-neutral-500">
                        Celebrating the visionary sponsors who are accelerating academic research and bringing sustainable ideas to life.
                    </p>
                </div>

                <section className="space-y-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-neutral-900">
                            <Trophy className="h-6 w-6 text-amber-500" /> Top Sponsors
                        </h2>
                        <p className="text-sm text-neutral-500">Most impactful contributors by total funding</p>
                    </div>
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="flex items-center gap-4 p-6">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-8 w-32" />
                                </CardContent>
                            </Card>
                        ))
                    ) : sponsorList.length > 0 ? (
                        pagedSponsors.map((sponsor, index) => (
                            <Card
                                key={sponsor.id}
                                className={`overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md ${((sponsorPage - 1) * PAGE_SIZE + index) === 0 ? "border-amber-300 ring-1 ring-amber-300 shadow-amber-100" : ""}`}
                            >
                                <CardContent className="flex items-center p-0">
                                    <div className={`flex w-16 items-center justify-center self-stretch sm:w-24 ${((sponsorPage - 1) * PAGE_SIZE + index) === 0 ? "bg-amber-50" : ((sponsorPage - 1) * PAGE_SIZE + index) === 1 ? "bg-slate-50" : ((sponsorPage - 1) * PAGE_SIZE + index) === 2 ? "bg-orange-50" : "border-r bg-neutral-50"}`}>
                                        {getRankBadge((sponsorPage - 1) * PAGE_SIZE + index)}
                                    </div>

                                    <div className="flex flex-1 items-center gap-4 p-4 sm:p-6">
                                        <Link href={`/users/${sponsor.id}`} className="rounded-full">
                                            <Avatar className={`h-12 w-12 border-2 transition-all hover:scale-105 sm:h-16 sm:w-16 ${((sponsorPage - 1) * PAGE_SIZE + index) < 3 ? "border-primary" : "border-transparent"}`}>
                                                <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                                                    {sponsor.name?.charAt(0) || "S"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-1">
                                            <Link href={`/users/${sponsor.id}`} className="hover:underline">
                                                <h3 className="line-clamp-1 text-lg font-bold text-neutral-900 sm:text-xl">{sponsor.name}</h3>
                                            </Link>
                                            <p className="flex items-center gap-1 text-sm text-neutral-500">
                                                <Heart className="h-3 w-3 fill-red-400 text-red-400" /> Supported {sponsor.supportCount ?? sponsor._count?.donations ?? 0} times
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-l bg-white p-4 text-right sm:p-6">
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Funded</p>
                                        <p className="text-xl font-black text-primary sm:text-2xl">
                                            ${Number(sponsor.totalFunded ?? sponsor.totalDonated ?? 0).toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="py-12 text-center text-neutral-500">
                            No sponsor data available yet.
                        </div>
                    )}

                    {!isLoading && sponsorList.length > 0 && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setSponsorPage((prev) => Math.max(1, prev - 1))} disabled={sponsorPage <= 1}>Previous</Button>
                            <p className="text-sm text-neutral-500">Page {sponsorPage} of {sponsorPages}</p>
                            <Button onClick={() => setSponsorPage((prev) => Math.min(sponsorPages, prev + 1))} disabled={sponsorPage >= sponsorPages}>Next</Button>
                        </div>
                    )}
                </section>

                <section className="mt-14 space-y-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-neutral-900">
                            <GraduationCap className="h-6 w-6 text-primary" /> Top Students
                        </h2>
                        <p className="text-sm text-neutral-500">Ranked by raised amount + review quality</p>
                    </div>

                    {isStudentsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Card key={`student-skeleton-${i}`}>
                                <CardContent className="flex items-center gap-4 p-6">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-8 w-28" />
                                </CardContent>
                            </Card>
                        ))
                    ) : topStudents && topStudents.length > 0 ? (
                        pagedStudents.map((student, index) => (
                            <Card key={student.id} className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
                                <CardContent className="flex items-center p-0">
                                    <div className={`flex w-16 items-center justify-center self-stretch sm:w-24 ${((studentPage - 1) * PAGE_SIZE + index) === 0 ? "bg-emerald-50" : ((studentPage - 1) * PAGE_SIZE + index) === 1 ? "bg-slate-50" : ((studentPage - 1) * PAGE_SIZE + index) === 2 ? "bg-lime-50" : "border-r bg-neutral-50"}`}>
                                        {getRankBadge((studentPage - 1) * PAGE_SIZE + index)}
                                    </div>

                                    <div className="flex flex-1 items-center gap-4 p-4 sm:p-6">
                                        <Link href={`/users/${student.id}`} className="rounded-full">
                                            <Avatar className={`h-12 w-12 border-2 transition-all hover:scale-105 sm:h-16 sm:w-16 ${((studentPage - 1) * PAGE_SIZE + index) < 3 ? "border-primary" : "border-transparent"}`}>
                                                <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                                                    {student.name?.charAt(0) || "S"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-1">
                                            <Link href={`/users/${student.id}`} className="hover:underline">
                                                <h3 className="line-clamp-1 text-lg font-bold text-neutral-900 sm:text-xl">{student.name}</h3>
                                            </Link>
                                            <p className="text-sm text-neutral-500">{student.university}</p>
                                            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {student.averageRating.toFixed(1)} ({student.totalReviews} review{student.totalReviews === 1 ? "" : "s"})
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-l bg-white p-4 text-right sm:p-6">
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Raised</p>
                                        <p className="text-xl font-black text-primary sm:text-2xl">${student.totalRaised.toLocaleString()}</p>
                                        <p className="mt-1 text-xs text-neutral-500">{student.projectCount} project{student.projectCount === 1 ? "" : "s"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="py-12 text-center text-neutral-500">No student ranking data available yet.</div>
                    )}

                    {!isStudentsLoading && studentList.length > 0 && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setStudentPage((prev) => Math.max(1, prev - 1))} disabled={studentPage <= 1}>Previous</Button>
                            <p className="text-sm text-neutral-500">Page {studentPage} of {studentPages}</p>
                            <Button onClick={() => setStudentPage((prev) => Math.min(studentPages, prev + 1))} disabled={studentPage >= studentPages}>Next</Button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
