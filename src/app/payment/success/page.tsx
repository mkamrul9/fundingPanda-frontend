"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";

export default function PaymentSuccessPage() {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />
            <div className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md animate-in zoom-in-95 text-center shadow-xl duration-500">
                    <CardHeader className="pt-8">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold text-neutral-900">
                            Payment Successful!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6 text-neutral-600">
                            Thank you for funding academic innovation. Your contribution has been securely processed and applied to the project.
                        </p>
                        <div className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-500">
                            A receipt will be sent to your registered email address shortly.
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pb-8">
                        <Link href="/dashboard" className="w-full">
                            <Button className="h-12 w-full text-lg">Go to Dashboard</Button>
                        </Link>
                        <Link href="/projects" className="w-full">
                            <Button variant="ghost" className="w-full text-neutral-500 hover:text-neutral-900">
                                Explore More Ideas <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
