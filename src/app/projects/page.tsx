"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAllProjects, getCategories } from "@/services/project.service";

import PublicNavbar from "../../components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Leaf } from "lucide-react";

export default function ExploreProjectsPage() {
    // State for our search and filter
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    // Fetch Categories for the dropdown
    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    // Fetch Projects (Auto-refetches when searchTerm or selectedCategory changes!)
    const { data: projects, isLoading } = useQuery({
        queryKey: ["allProjects", searchTerm, selectedCategory],
        queryFn: () => getAllProjects({ searchTerm, category: selectedCategory }),
    });

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />

            {/* Header Section */}
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

            <main className="container mx-auto px-4 md:px-8 py-8 flex-1">
                {/* Search and Filter Bar */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by keyword or title..."
                            className="pl-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-[200px] border-l pl-4">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="border-0 bg-transparent focus:ring-0 shadow-none">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {categories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Project Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="h-48 w-full rounded-none" />
                                <CardHeader className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></CardHeader>
                                <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                            </Card>
                        ))
                    ) : projects && projects.length > 0 ? (
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
                                    <p className="line-clamp-3 text-sm text-neutral-500">{project.description}</p>
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
                        <div className="col-span-full py-24 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                                <Search className="h-8 w-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900">No projects found</h3>
                            <p className="text-neutral-500">Try adjusting your search or category filters.</p>
                            <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setSelectedCategory("ALL"); }}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}