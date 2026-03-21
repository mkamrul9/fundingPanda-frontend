import Link from "next/link";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Compass, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />

            <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 rounded-full bg-emerald-100 opacity-50 blur-3xl"></div>
                    <Compass className="relative z-10 h-32 w-32 animate-pulse text-emerald-600" />
                </div>

                <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-neutral-900">404 - Lost in the Lab</h1>
                <p className="mb-8 max-w-lg text-xl text-neutral-600">
                    We could not find the page you are looking for. It might have been moved, deleted, or perhaps it is still a prototype.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href="/projects">
                        <Button size="lg" className="w-full gap-2 sm:w-auto">
                            <Search className="h-4 w-4" /> Discover Projects
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}