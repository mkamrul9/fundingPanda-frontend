"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyProjects } from "@/services/project.service";
import { getMyDonations } from "@/services/donation.service";
import { getMyResourceClaims } from "@/services/resource.service";
import { getMyNotifications } from "@/services/notification.service";
import { getPlatformAnalytics, getPendingProjects } from "@/services/admin.service";
import { ArrowUpRight, Bell, FolderKanban, HandCoins, ShieldCheck, Users } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DashboardProject = {
    id: string;
    status: "DRAFT" | "PENDING" | "APPROVED" | "FUNDED" | "COMPLETED";
    raisedAmount: number;
    goalAmount: number;
};

type DonationRow = {
    amount: number;
    createdAt?: string;
    project?: {
        id: string;
        title: string;
        status?: string;
    };
};

type AdminAnalytics = {
    totalUsers: number;
    totalProjects: number;
    pendingProjects: number;
    totalResources: number;
    totalFundsRaised: number;
};

const currency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

const percent = (part: number, total: number) => {
    if (!total) return 0;
    return Math.min(100, Math.round((part / total) * 100));
};

const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function DashboardPage() {
    const { data: session } = useSession();
    const user = session?.user as unknown as User | undefined;
    const isAdmin = user?.role === "ADMIN";
    const isSponsor = user?.role === "SPONSOR";
    const isStudent = user?.role === "STUDENT";

    const { data: notifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: getMyNotifications,
        enabled: !!session,
        refetchInterval: 15000,
    });

    const { data: myProjects = [], isLoading: loadingProjects } = useQuery<DashboardProject[]>({
        queryKey: ["myProjects", "dashboard"],
        queryFn: getMyProjects,
        enabled: isStudent,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const { data: myDonations = [], isLoading: loadingDonations } = useQuery<DonationRow[]>({
        queryKey: ["myDonations", user?.id],
        queryFn: () => getMyDonations(user?.id),
        enabled: isSponsor,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const { data: myClaims = [], isLoading: loadingClaims } = useQuery({
        queryKey: ["myResourceClaims", user?.id],
        queryFn: getMyResourceClaims,
        enabled: isStudent,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const { data: adminAnalytics, isLoading: loadingAdminAnalytics } = useQuery<AdminAnalytics>({
        queryKey: ["adminAnalytics"],
        queryFn: getPlatformAnalytics,
        enabled: isAdmin,
        refetchInterval: 20000,
    });

    const { data: pendingProjects = [], isLoading: loadingPendingProjects } = useQuery({
        queryKey: ["pendingProjects", "dashboard"],
        queryFn: getPendingProjects,
        enabled: isAdmin,
        refetchInterval: 20000,
    });

    const studentMetrics = useMemo(() => {
        const totalProjects = myProjects.length;
        const draftCount = myProjects.filter((project) => project.status === "DRAFT").length;
        const inReviewCount = myProjects.filter((project) => project.status === "PENDING").length;
        const approvedCount = myProjects.filter((project) => project.status === "APPROVED" || project.status === "FUNDED" || project.status === "COMPLETED").length;
        const completedCount = myProjects.filter((project) => project.status === "COMPLETED").length;
        const totalRaised = myProjects.reduce((sum, project) => sum + (project.raisedAmount || 0), 0);
        const totalGoal = myProjects.reduce((sum, project) => sum + (project.goalAmount || 0), 0);

        return {
            totalProjects,
            draftCount,
            inReviewCount,
            approvedCount,
            completedCount,
            totalRaised,
            totalGoal,
            progressPercent: percent(totalRaised, totalGoal),
            claimCount: Array.isArray(myClaims) ? myClaims.length : 0,
        };
    }, [myProjects, myClaims]);

    const sponsorMetrics = useMemo(() => {
        const totalDonated = myDonations.reduce((sum, item) => sum + (item.amount || 0), 0);
        const donationCount = myDonations.length;
        const uniqueProjects = new Set(myDonations.map((item) => item.project?.id).filter(Boolean)).size;
        const completedBackedProjects = myDonations.filter((item) => item.project?.status === "COMPLETED").length;
        const activeBackedProjects = myDonations.filter((item) => {
            const status = item.project?.status;
            return status && status !== "COMPLETED";
        }).length;

        return {
            totalDonated,
            donationCount,
            uniqueProjects,
            completedBackedProjects,
            activeBackedProjects,
        };
    }, [myDonations]);

    const unreadNotifications = notifications?.unreadCount ?? 0;

    const adminBarData = useMemo(() => {
        if (!adminAnalytics) return [];
        return [
            { label: "Users", value: adminAnalytics.totalUsers ?? 0 },
            { label: "Projects", value: adminAnalytics.totalProjects ?? 0 },
            { label: "Pending", value: adminAnalytics.pendingProjects ?? 0 },
            { label: "Resources", value: adminAnalytics.totalResources ?? 0 },
        ];
    }, [adminAnalytics]);

    const adminPieData = useMemo(() => {
        if (!adminAnalytics) return [];
        const pending = adminAnalytics.pendingProjects ?? 0;
        const totalProjects = adminAnalytics.totalProjects ?? 0;
        const reviewed = Math.max(0, totalProjects - pending);
        return [
            { name: "Pending", value: pending },
            { name: "Reviewed", value: reviewed },
        ];
    }, [adminAnalytics]);

    const sponsorTrendData = useMemo(() => {
        return myDonations
            .slice(0, 10)
            .map((item, index) => ({
                index: index + 1,
                amount: Number(item.amount || 0),
            }))
            .reverse();
    }, [myDonations]);

    const studentStatusData = useMemo(() => {
        return [
            { name: "Draft", value: studentMetrics.draftCount },
            { name: "In Review", value: studentMetrics.inReviewCount },
            { name: "Approved", value: studentMetrics.approvedCount },
            { name: "Completed", value: studentMetrics.completedCount },
        ].filter((item) => item.value > 0);
    }, [studentMetrics]);

    if (!session || !user) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Dashboard Overview</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {user.name}</h1>
                        <p className="mt-2 text-sm text-slate-200 sm:text-base">
                            {isAdmin && "Live platform intelligence, moderation pressure, and growth signals in one place."}
                            {isSponsor && "See where your funding is creating impact and which projects need your attention."}
                            {isStudent && "Track your project journey, progress to funding, and completion performance."}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                        <p className="text-xs uppercase tracking-wider text-slate-200">Role</p>
                        <p className="text-lg font-semibold">{user.role}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {user.name}</p>
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">University:</span> {user.university || "Not set"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Badge variant={user.isVerified ? "default" : "outline"}>
                            {user.isVerified ? "Verified" : "Not verified"}
                        </Badge>
                        <p className="text-xs text-neutral-500">Verification improves trust for collaboration and funding decisions.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <Bell className="h-5 w-5 text-primary" />
                            {unreadNotifications}
                        </div>
                        <p className="text-xs text-neutral-500">Unread messages, approvals, milestone updates, and funding activity.</p>
                    </CardContent>
                </Card>
            </div>

            {isAdmin && (
                <>
                    {loadingAdminAnalytics ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Card key={index}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <Card className="border-l-4 border-l-sky-500"><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Total Users</p><p className="mt-2 text-3xl font-bold">{adminAnalytics?.totalUsers ?? 0}</p></CardContent></Card>
                            <Card className="border-l-4 border-l-indigo-500"><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Total Projects</p><p className="mt-2 text-3xl font-bold">{adminAnalytics?.totalProjects ?? 0}</p></CardContent></Card>
                            <Card className="border-l-4 border-l-amber-500"><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Pending Moderation</p><p className="mt-2 text-3xl font-bold">{adminAnalytics?.pendingProjects ?? 0}</p></CardContent></Card>
                            <Card className="border-l-4 border-l-emerald-500"><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Total Resources</p><p className="mt-2 text-3xl font-bold">{adminAnalytics?.totalResources ?? 0}</p></CardContent></Card>
                            <Card className="border-l-4 border-l-rose-500"><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Funds Raised</p><p className="mt-2 text-3xl font-bold">{currency(adminAnalytics?.totalFundsRaised ?? 0)}</p></CardContent></Card>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Moderation Queue Pulse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loadingPendingProjects ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Projects waiting for admin decision</span>
                                        <span className="font-semibold">{Array.isArray(pendingProjects) ? pendingProjects.length : 0}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-neutral-100">
                                        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (Array.isArray(pendingProjects) ? pendingProjects.length : 0) * 8)}%` }} />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Footprint</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 w-full">
                                    {loadingAdminAnalytics ? (
                                        <Skeleton className="h-full w-full" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={adminBarData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                                                <YAxis tickLine={false} axisLine={false} />
                                                <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Count"]} />
                                                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Moderation Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 w-full">
                                    {loadingAdminAnalytics ? (
                                        <Skeleton className="h-full w-full" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={adminPieData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3}>
                                                    {adminPieData.map((entry, index) => (
                                                        <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Projects"]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {isSponsor && (
                <>
                    {loadingDonations ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Card key={index}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <Card><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Total Donated</p><p className="mt-2 text-3xl font-bold">{currency(sponsorMetrics.totalDonated)}</p></CardContent></Card>
                            <Card><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Donations Made</p><p className="mt-2 text-3xl font-bold">{sponsorMetrics.donationCount}</p></CardContent></Card>
                            <Card><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Unique Projects Backed</p><p className="mt-2 text-3xl font-bold">{sponsorMetrics.uniqueProjects}</p></CardContent></Card>
                            <Card><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Completed Backed Projects</p><p className="mt-2 text-3xl font-bold">{sponsorMetrics.completedBackedProjects}</p></CardContent></Card>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><HandCoins className="h-5 w-5 text-primary" /> Sponsor Impact Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-neutral-50 p-4">
                                <p className="text-xs uppercase text-neutral-500">Active backed projects</p>
                                <p className="mt-1 text-2xl font-bold">{sponsorMetrics.activeBackedProjects}</p>
                            </div>
                            <div className="rounded-xl border bg-neutral-50 p-4">
                                <p className="text-xs uppercase text-neutral-500">Average donation size</p>
                                <p className="mt-1 text-2xl font-bold">{currency(sponsorMetrics.donationCount ? sponsorMetrics.totalDonated / sponsorMetrics.donationCount : 0)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Donation Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 w-full">
                                {loadingDonations ? (
                                    <Skeleton className="h-full w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sponsorTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                            <XAxis dataKey="index" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Donation"]} />
                                            <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {isStudent && (
                <>
                    {(loadingProjects || loadingClaims) ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Card key={index}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <Card><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Total Projects</p><p className="mt-2 text-3xl font-bold">{studentMetrics.totalProjects}</p></CardContent></Card>
                            <Card><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">In Review</p><p className="mt-2 text-3xl font-bold">{studentMetrics.inReviewCount}</p></CardContent></Card>
                            <Card><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Approved/Funded</p><p className="mt-2 text-3xl font-bold">{studentMetrics.approvedCount}</p></CardContent></Card>
                            <Card><CardContent className="p-6"><p className="text-xs uppercase text-neutral-500">Resources Claimed</p><p className="mt-2 text-3xl font-bold">{studentMetrics.claimCount}</p></CardContent></Card>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-primary" /> Student Progress Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border bg-neutral-50 p-4">
                                    <p className="text-xs uppercase text-neutral-500">Total Raised</p>
                                    <p className="mt-1 text-2xl font-bold">{currency(studentMetrics.totalRaised)}</p>
                                    <p className="mt-1 text-xs text-neutral-500">Goal tracked: {currency(studentMetrics.totalGoal)}</p>
                                </div>
                                <div className="rounded-xl border bg-neutral-50 p-4">
                                    <p className="text-xs uppercase text-neutral-500">Completed Projects</p>
                                    <p className="mt-1 text-2xl font-bold">{studentMetrics.completedCount}</p>
                                    <p className="mt-1 text-xs text-neutral-500">Drafts remaining: {studentMetrics.draftCount}</p>
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span>Funding progress across all your projects</span>
                                    <span className="font-semibold">{studentMetrics.progressPercent}%</span>
                                </div>
                                <div className="h-3 rounded-full bg-neutral-100">
                                    <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-primary" style={{ width: `${studentMetrics.progressPercent}%` }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project Status Mix</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 w-full">
                                {(loadingProjects || loadingClaims) ? (
                                    <Skeleton className="h-full w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={studentStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={84} paddingAngle={3}>
                                                {studentStatusData.map((entry, index) => (
                                                    <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Projects"]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-xs uppercase text-neutral-500">Next recommended action</p>
                            <p className="mt-1 font-semibold text-neutral-900">
                                {isAdmin && "Review pending submissions to reduce moderation backlog."}
                                {isSponsor && "Follow up with active projects and complete pending support decisions."}
                                {isStudent && "Move ready drafts to review with complete pitch files and images."}
                            </p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-primary" />
                    </CardContent>
                </Card>

                <Card className="border-dashed">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-xs uppercase text-neutral-500">Live signal</p>
                            <p className="mt-1 font-semibold text-neutral-900">{unreadNotifications} unread account alerts waiting.</p>
                        </div>
                        <Users className="h-5 w-5 text-primary" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}