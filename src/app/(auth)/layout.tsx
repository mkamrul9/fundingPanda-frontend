import { ReactNode } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react"; // A nice icon to represent Eco/Growth

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left Side: The Form (Your login/register pages inject here) */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8 lg:py-24">
                <div className="mx-auto w-full max-w-md">
                    {/* Brand Logo Header */}
                    <div className="mb-8 flex justify-center lg:justify-start">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
                                <Leaf className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-neutral-900">
                                Funding<span className="text-primary">Panda</span>
                            </span>
                        </Link>
                    </div>

                    {/* The Actual Page Content */}
                    {children}
                </div>
            </div>

            {/* Right Side: The Premium Branding Panel (Hidden on mobile) */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                {/* A beautiful gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-slate-900/90 z-10" />

                {/* Placeholder for an inspirational background image */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop')" }}
                />

                <div className="relative z-20 flex h-full flex-col justify-center px-16 text-white">
                    <h2 className="text-4xl font-bold tracking-tight mb-6">
                        Fueling the future of academic innovation.
                    </h2>
                    <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                        Join thousands of researchers and sponsors collaborating to bring groundbreaking sustainable ideas and hardware projects to life.
                    </p>

                    <div className="mt-12 flex items-center gap-4">
                        <div className="flex -space-x-4">
                            {/* Dummy avatars for social proof */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-200" />
                            ))}
                        </div>
                        <p className="text-sm font-medium text-slate-300">
                            Trusted by 500+ universities worldwide.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}