"use client";

import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";

export default function PaymentCancelPage() {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <PublicNavbar />
            <div className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 text-center shadow-lg duration-500">
                    <CardHeader className="pt-8">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-neutral-900">
                            Payment Cancelled
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-neutral-600">
                            Your checkout process was safely cancelled. No charges were made to your account.
                        </p>
                    </CardContent>
                    <CardFooter className="pb-8">
                        <Link href="/projects" className="w-full">
                            <Button variant="outline" className="h-12 w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Return to Projects
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
