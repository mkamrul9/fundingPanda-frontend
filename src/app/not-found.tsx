import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Leaf } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <FileQuestion className="h-10 w-10 text-primary" />
            </div>

            <h1 className="mb-2 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Page not found
            </h1>

            <p className="mb-8 max-w-md text-lg text-neutral-500">
                Sorry, we could not find the page you are looking for. It might have been moved or deleted.
            </p>

            <div className="flex gap-4">
                <Link href="/">
                    <Button size="lg" className="gap-2">
                        <Leaf className="h-4 w-4" />
                        Return Home
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="outline" size="lg">
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}