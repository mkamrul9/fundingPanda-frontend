"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Global Error Caught by Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 shadow-sm border border-red-200">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>

      <h1 className="mb-4 text-4xl font-extrabold text-neutral-900 tracking-tight">
        System Malfunction
      </h1>

      <p className="mb-8 max-w-md text-lg text-neutral-600">
        We encountered an unexpected error while processing your request. Don&apos;t
        worry, your data is safe.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* The reset function attempts to re-render the segment that crashed */}
        <Button onClick={() => reset()} size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
            <Home className="h-4 w-4" /> Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
