"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAllProjects, getCategories } from "@/services/project.service";

import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Leaf, Filter, X } from "lucide-react";

export default function ExploreProjectsPage() {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced Filter State Object
    const [filters, setFilters] = useState({
        searchTerm: "",       // Maps to backend search (Title/Description)
        studentName: "",      // Maps to backend student.name
        university: "",       // Maps to backend student.university
        category: "ALL",
        fundingStatus: "ALL", // Maps to a backend custom filter logic (e.g., raisedAmount >= goalAmount)
        startDate: "",
        endDate: "",
        sortBy: "-createdAt"  // Default: Newest first
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    // Fetch Projects triggers automatically when the `filters` object changes
    const { data: projects, isLoading, isError } = useQuery({
        queryKey: ["allProjects", filters],
        queryFn: () => getAllProjects(filters),
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: "", studentName: "", university: "",
            category: "ALL", fundingStatus: "ALL", startDate: "", endDate: "", sortBy: "-createdAt"
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />

            <div className="bg-white border-b py-12">
                <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-4">
                        Explore <span className="text-primary">Ideas</span>
                    </h1>
                    <p className="text-lg text-neutral-500">
                        Browse through hundreds of vetted, sustainable academic projects waiting for your support and expertise.
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-8">

                {/* SIDEBAR FILTERS (Desktop) / TOP FILTERS (Mobile) */}
                <aside className="w-full lg:w-64 shrink-0 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Filter className="h-5 w-5" /> Filters
                        </h2>
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-neutral-500 h-8 px-2">
                            Clear all
                        </Button>
                    </div>

                    {/* Primary Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search Keyword</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Title or keywords..."
                                className="pl-9"
                                value={filters.searchTerm}
                                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={filters.category} onValueChange={(v) => handleFilterChange("category", v)}>
                            <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {categories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sort By</label>
                        <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange("sortBy", v)}>
                            <SelectTrigger><SelectValue placeholder="Sort order" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="-createdAt">Newest First</SelectItem>
                                <SelectItem value="createdAt">Oldest First</SelectItem>
                                <SelectItem value="-raisedAmount">Most Funded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Advanced Toggle */}
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        Advanced Filters {showAdvanced ? <X className="h-4 w-4" /> : <span className="text-xs">▼</span>}
                    </Button>

                    {/* Advanced Filters Panel */}
                    {showAdvanced && (
                        <div className="space-y-6 pt-2 animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Student Name</label>
                                <Input
                                    placeholder="e.g. Kamrul"
                                    value={filters.studentName}
                                    onChange={(e) => handleFilterChange("studentName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">University</label>
                                <Input
                                    placeholder="e.g. MIT"
                                    value={filters.university}
                                    onChange={(e) => handleFilterChange("university", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Funding Status</label>
                                <Select value={filters.fundingStatus} onValueChange={(v) => handleFilterChange("fundingStatus", v)}>
                                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Any Status</SelectItem>
                                        <SelectItem value="NEEDS_FUNDING">Needs Funding</SelectItem>
                                        <SelectItem value="FULLY_FUNDED">Fully Funded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">From Date</label>
                                    <Input type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} className="text-xs" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">To Date</label>
                                    <Input type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} className="text-xs" />
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* MAIN PROJECT GRID */}
                <div className="flex-1 space-y-6">

                    {/* NEW: Quick Filter Tabs (Industry Standard UX) */}
                    <div className="flex items-center gap-2 border-b pb-4 overflow-x-auto whitespace-nowrap">
                        <Button
                            variant={filters.sortBy === "-createdAt" && filters.fundingStatus === "ALL" ? "default" : "ghost"}
                            onClick={() => { setFilters(prev => ({ ...prev, sortBy: "-createdAt", fundingStatus: "ALL" })) }}
                            className="rounded-full"
                        >
                            Newest First
                        </Button>
                        <Button
                            variant={filters.sortBy === "-raisedAmount" ? "default" : "ghost"}
                            onClick={() => { setFilters(prev => ({ ...prev, sortBy: "-raisedAmount", fundingStatus: "ALL" })) }}
                            className="rounded-full"
                        >
                            Top Funded (All Time)
                        </Button>
                        <Button
                            variant={filters.fundingStatus === "NEEDS_FUNDING" ? "default" : "ghost"}
                            onClick={() => { setFilters(prev => ({ ...prev, fundingStatus: "NEEDS_FUNDING", sortBy: "createdAt" })) }}
                            className="rounded-full"
                        >
                            Closing Soon / Needs Funding
                        </Button>
                    </div>

                    {/* Active Filter Indicators (Shows the user what is currently applied) */}
                    {(filters.searchTerm || filters.studentName || filters.university || filters.category !== "ALL") && (
                        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                            <span>Active filters:</span>
                            {filters.searchTerm && <Badge variant="secondary">Keyword: {filters.searchTerm}</Badge>}
                            {filters.category !== "ALL" && <Badge variant="secondary">Category Filtered</Badge>}
                            {filters.university && <Badge variant="secondary">Uni: {filters.university}</Badge>}
                        </div>
                    )}

                    {/* The Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {isLoading ? (
                            // ... Keep your existing skeleton loading state here ...
                            Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <Skeleton className="h-48 w-full rounded-none" />
                                    <CardHeader className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></CardHeader>
                                    <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                                </Card>
                            ))
                        ) : isError ? (
                            <div className="col-span-full py-24 text-center border-2 border-dashed rounded-xl">
                                <h3 className="text-lg font-semibold text-neutral-900">Could not load projects</h3>
                                <p className="text-neutral-500">Please make sure backend server is running and try again.</p>
                            </div>
                        ) : projects && projects.length > 0 ? (
                            // ... Keep your existing project mapping logic here ...
                            projects.map((project: any) => (
                                <Card key={project.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                                    <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                                        {project.images?.[0] ? (
                                            <img src={project.images[0]} alt={project.title} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-emerald-50 text-emerald-200">
                                                <Leaf className="h-16 w-16" />
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="pb-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <Badge variant="secondary" className="text-xs font-medium text-primary bg-primary/10">
                                                {project.categories?.[0]?.name || "Sustainability"}
                                            </Badge>
                                        </div>
                                        <h3 className="line-clamp-2 text-lg font-bold leading-tight">{project.title}</h3>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-4">
                                        <p className="whitespace-pre-wrap wrap-break-word text-sm text-neutral-500">{project.description}</p>
                                    </CardContent>
                                    <CardFooter className="border-t bg-neutral-50/50 p-4">
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-neutral-500">Raised</span>
                                                <span className="font-semibold text-primary">${project.raisedAmount} / ${project.goalAmount}</span>
                                            </div>
                                            <Link href={`/projects/${project.id}`}>
                                                <Button size="sm">View Idea</Button>
                                            </Link>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center border-2 border-dashed rounded-xl">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                                    <Search className="h-8 w-8 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900">No projects match your criteria</h3>
                                <p className="text-neutral-500">There are currently no approved projects matching this search.</p>
                                <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear All Filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}