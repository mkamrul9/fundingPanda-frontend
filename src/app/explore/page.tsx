"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getExploreProjects } from "@/services/project.service";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal } from "lucide-react";

type CategoryItem = {
    id: string;
    name: string;
};

type ExploreProject = {
    id: string;
    title: string;
    description: string;
    status: string;
    images?: string[];
    raisedAmount: number;
    goalAmount: number;
    categories?: Array<{ id: string; name: string }>;
    student?: { name?: string; university?: string };
};

type ExploreMeta = {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
};

const PAGE_LIMIT = 8;

export default function ExplorePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("ALL");
    const [status, setStatus] = useState("APPROVED");
    const [university, setUniversity] = useState("");
    const [sortBy, setSortBy] = useState("createdAt_desc");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: categories = [] } = useQuery<CategoryItem[]>({
        queryKey: ["categories", "explore"],
        queryFn: getCategories,
    });

    const { data: projectsData, isLoading } = useQuery({
        queryKey: ["exploreProjects", debouncedSearch, category, status, university, sortBy, page],
        queryFn: () =>
            getExploreProjects({
                searchTerm: debouncedSearch,
                status: status === "ALL" ? undefined : status,
                university: university.trim() || undefined,
                sortBy,
                page,
                limit: PAGE_LIMIT,
            }),
    });

    const rawProjects = useMemo(() => (projectsData?.data ?? []) as ExploreProject[], [projectsData?.data]);
    const meta = (projectsData?.meta ?? { totalPage: 1, page: 1 }) as ExploreMeta;

    const projects = useMemo(() => {
        if (category === "ALL") return rawProjects;
        return rawProjects.filter((project) => project.categories?.some((cat) => cat.id === category));
    }, [rawProjects, category]);

    const totalPages = Math.max(1, Number(meta.totalPage ?? 1));

    const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setDebouncedSearch(searchTerm.trim());
        setPage(1);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setDebouncedSearch("");
        setCategory("ALL");
        setStatus("APPROVED");
        setUniversity("");
        setSortBy("createdAt_desc");
        setPage(1);
    };

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicNavbar />

            <main className="container mx-auto max-w-350 flex-1 px-4 py-8">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">Explore Ideas</h1>
                        <p className="text-muted-foreground">Discover and fund the next generation of academic innovation.</p>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 md:w-auto">
                        <Input
                            placeholder="Search ideas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background md:w-72"
                        />
                        <Button type="submit" size="icon" aria-label="Search ideas">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="w-full shrink-0 lg:w-72">
                        <div className="sticky top-24 rounded-xl border bg-card p-5 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-bold">
                                <Filter className="h-4 w-4" /> Filters
                            </h3>

                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-semibold text-muted-foreground">Discipline</label>
                                <Select
                                    value={category}
                                    onValueChange={(value) => {
                                        setCategory(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-muted-foreground">Project Status</label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => {
                                        setStatus(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder="Any Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Any Status</SelectItem>
                                        <SelectItem value="APPROVED">Seeking Funding</SelectItem>
                                        <SelectItem value="FUNDED">Goal Reached</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-muted-foreground">University</label>
                                <Input
                                    value={university}
                                    onChange={(e) => {
                                        setUniversity(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="e.g. Stanford"
                                    className="bg-background"
                                />
                            </div>

                            <Button variant="outline" className="w-full text-xs" onClick={clearFilters}>
                                Clear All Filters
                            </Button>
                        </div>
                    </aside>

                    <section className="flex-1">
                        <div className="mb-6 flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm">
                            <span className="ml-2 text-sm font-medium text-muted-foreground">
                                Showing {projects.length} result{projects.length === 1 ? "" : "s"}
                            </span>

                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground sm:block" />
                                <Select
                                    value={sortBy}
                                    onValueChange={(value) => {
                                        setSortBy(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-44 border-0 bg-background shadow-none focus:ring-0 sm:w-52">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt_desc">Newest First</SelectItem>
                                        <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                                        <SelectItem value="goalAmount_desc">Highest Funding Goal</SelectItem>
                                        <SelectItem value="goalAmount_asc">Lowest Funding Goal</SelectItem>
                                        <SelectItem value="raisedAmount_desc">Most Raised</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {isLoading
                                ? Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                                    <Card key={i} className="flex h-full flex-col overflow-hidden">
                                        <Skeleton className="h-40 w-full rounded-none" />
                                        <CardHeader>
                                            <Skeleton className="h-5 w-3/4" />
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </CardContent>
                                        <CardFooter>
                                            <Skeleton className="h-9 w-full" />
                                        </CardFooter>
                                    </Card>
                                ))
                                : projects.map((project) => {
                                    const progress = Math.min(
                                        100,
                                        Math.round(((project.raisedAmount || 0) / Math.max(project.goalAmount || 1, 1)) * 100)
                                    );

                                    return (
                                        <Card key={project.id} className="flex h-full flex-col overflow-hidden bg-card transition-shadow hover:shadow-lg">
                                            <div className="relative h-40 bg-linear-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20">
                                                <Badge className="absolute right-3 top-3 bg-white/90 text-emerald-800 hover:bg-white">
                                                    {project.status}
                                                </Badge>
                                            </div>

                                            <CardHeader className="pb-2">
                                                <CardTitle className="line-clamp-1 text-lg" title={project.title}>
                                                    {project.title}
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="flex-1 pb-4">
                                                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{project.description}</p>

                                                <div className="mt-auto space-y-2">
                                                    <div className="h-1.5 w-full rounded-full bg-secondary">
                                                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-emerald-600">${project.raisedAmount?.toLocaleString() || 0}</span>
                                                        <span className="text-muted-foreground">Goal: ${project.goalAmount?.toLocaleString() || 0}</span>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            <CardFooter className="mt-4 border-t bg-muted/20 px-6 pb-4 pt-0">
                                                <Link href={`/projects/${project.id}`} className="mt-4 w-full">
                                                    <Button className="w-full">View Details</Button>
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                        </div>

                        {!isLoading && projects.length === 0 && (
                            <div className="col-span-full rounded-xl border-2 border-dashed bg-card py-24 text-center">
                                <h3 className="mb-2 text-xl font-bold text-muted-foreground">No projects found.</h3>
                                <p className="text-sm text-muted-foreground">Try adjusting your filters or search term.</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-4">
                                <Button variant="outline" disabled={page === 1 || isLoading} onClick={() => setPage((p) => p - 1)}>
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <span className="text-sm font-medium text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={page === totalPages || isLoading}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
