"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Root Error Caught:", error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-red-200 bg-red-100 shadow-sm">
                        <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>

                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-900">
                        System Malfunction
                    </h1>

                    <p className="mb-8 max-w-md text-lg text-neutral-600">
                        We encountered an unexpected error while processing your request.
                        Don&apos;t worry, your data is safe.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button onClick={() => reset()} size="lg" className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Try Again
                        </Button>
                        <Link href="/">
                            <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                                <Home className="h-4 w-4" /> Return Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
