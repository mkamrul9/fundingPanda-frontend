import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Leaf, Globe, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />
            <div className="bg-slate-900 py-24 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/20" />
                <div className="container relative z-10 mx-auto px-4">
                    <Leaf className="h-16 w-16 mx-auto mb-6 text-emerald-400" />
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Bridging the Gap Between Academia and Industry</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">FundingPanda is the premier crowdfunding platform dedicated to bringing sustainable, hardware-based thesis projects to life.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24">
                <h2 className="text-3xl font-bold text-center mb-16">Our Mission</h2>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="text-center space-y-4">
                        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><Globe className="h-8 w-8" /></div>
                        <h3 className="text-xl font-bold">Sustainable Innovation</h3>
                        <p className="text-neutral-600">We prioritize projects that aim to solve environmental challenges, from clean energy to waste reduction.</p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto"><Users className="h-8 w-8" /></div>
                        <h3 className="text-xl font-bold">Empowering Students</h3>
                        <p className="text-neutral-600">Brilliant ideas shouldn't die in a university library. We give students the platform to pitch directly to those who can fund them.</p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto"><Zap className="h-8 w-8" /></div>
                        <h3 className="text-xl font-bold">Accelerating Tech</h3>
                        <p className="text-neutral-600">By connecting sponsors with researchers early, we drastically reduce the time it takes for prototypes to hit the market.</p>
                    </div>
                </div>
            </div>

            <div className="bg-primary py-16 mt-auto">
                <div className="container mx-auto px-4 text-center text-primary-foreground">
                    <h2 className="text-3xl font-bold mb-6">Ready to make an impact?</h2>
                    <div className="flex justify-center gap-4">
                        <Link href="/register"><Button size="lg" variant="secondary" className="text-primary font-bold">Join FundingPanda</Button></Link>
                        <Link href="/projects"><Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">Explore Ideas</Button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
