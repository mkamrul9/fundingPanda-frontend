"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentType } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Archive,
    Bell,
    FolderKanban,
    HandCoins,
    LayoutDashboard,
    Leaf,
    LogOut,
    MessageSquare,
    Package,
    Receipt,
    Rocket,
    Settings,
    ShieldCheck,
    Tags,
    Trophy,
    Users,
} from "lucide-react";

type MenuItem = {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
};

export function ProfileDropdown() {
    const { data: session } = useSession();
    const router = useRouter();

    if (!session?.user) return null;

    const user = session.user as unknown as User;
    const role = user.role;

    const commonItems: MenuItem[] = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/messages", label: "Inbox", icon: MessageSquare },
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const studentItems: MenuItem[] = [
        { href: "/projects", label: "Explore Ideas", icon: Leaf },
        { href: "/dashboard/my-projects", label: "My Projects", icon: FolderKanban },
        { href: "/dashboard/create-project", label: "Create Project", icon: Rocket },
        { href: "/dashboard/resources", label: "Resource Hub", icon: Package },
        { href: "/dashboard/my-items", label: "My Claimed Items", icon: Archive },
    ];

    const sponsorItems: MenuItem[] = [
        { href: "/projects", label: "Explore Ideas", icon: Leaf },
        { href: "/dashboard/donations", label: "My Donated Projects", icon: HandCoins },
        { href: "/dashboard/resources", label: "Resource Hub", icon: Package },
        { href: "/dashboard/my-items", label: "My Listed Items", icon: Archive },
    ];

    const adminItems: MenuItem[] = [
        { href: "/dashboard/admin", label: "Moderation Queue", icon: ShieldCheck },
        { href: "/dashboard/admin/categories", label: "Manage Categories", icon: Tags },
        { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
        { href: "/dashboard/admin/donations", label: "Global Ledger", icon: Receipt },
        { href: "/projects", label: "Explore Ideas", icon: Leaf },
    ];

    const roleItems = role === "ADMIN" ? adminItems : role === "SPONSOR" ? sponsorItems : studentItems;

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    const initials = session.user.name?.substring(0, 2).toUpperCase() || "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                        <AvatarFallback className="bg-primary/10 font-bold text-primary">{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 rounded-xl border-primary/20 shadow-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="space-y-1 rounded-lg bg-primary/5 p-3">
                        <p className="text-sm font-semibold leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                        <p className="pt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{role}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {commonItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <DropdownMenuItem className="cursor-pointer rounded-md py-2">
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Role Shortcuts</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {roleItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <DropdownMenuItem className="cursor-pointer rounded-md py-2">
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
