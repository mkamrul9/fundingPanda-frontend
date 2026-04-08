"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitContactForm } from "@/services/marketing.service";
import { extractApiErrorMessage } from "@/lib/api-error";
import Link from "next/link";

import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

    const contactMutation = useMutation({
        mutationFn: submitContactForm,
        onSuccess: () => {
            toast.success("Message sent successfully! Our team will get back to you within 24 hours.");
            setFormData({ name: "", email: "", subject: "", message: "" });
        },
        onError: (error: unknown) => {
            toast.error(extractApiErrorMessage(error, "Message could not be sent. Please try again in a moment."));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill out all required fields.");
            return;
        }
        contactMutation.mutate(formData);
    };

    return (
        <div className="flex min-h-screen flex-col bg-transparent">
            <PublicNavbar />

            <div className="relative overflow-hidden bg-slate-900 py-20 text-center text-white">
                <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-emerald-400/20 blur-3xl" />
                <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="container mx-auto px-4">
                    <h1 className="mb-4 text-4xl font-extrabold md:text-5xl">Get in Touch</h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-300">
                        Whether you are a student stuck on submission or a sponsor looking to partner with universities, our team is here to help.
                    </p>
                </div>
            </div>

            <main className="container mx-auto flex max-w-6xl flex-1 px-4 py-16">
                <div className="grid gap-12 md:grid-cols-3">
                    <div className="space-y-8 md:col-span-1">
                        <div>
                            <h3 className="mb-6 text-2xl font-bold text-neutral-900">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-neutral-900">Email Us</h4>
                                        <p className="text-sm text-neutral-500">support@fundingpanda.com</p>
                                        <p className="text-sm text-neutral-500">partnerships@fundingpanda.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-neutral-900">Headquarters</h4>
                                        <p className="text-sm text-neutral-500">Innovation Hub, Suite 400<br />San Francisco, CA 94105</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="app-card rounded-xl p-6">
                            <h4 className="mb-2 flex items-center gap-2 font-bold text-neutral-900">
                                <MessageSquare className="h-5 w-5 text-primary" /> FAQ
                            </h4>
                            <p className="mb-4 text-sm text-neutral-600">
                                Have a quick question about Stripe payments or project reviews? Check our Help Center first.
                            </p>
                            <Link href="/faq">
                                <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">Visit Help Center</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <Card className="app-card border-0 shadow-lg ring-1 ring-neutral-200/60">
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Your Name *</label>
                                            <Input placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address *</label>
                                            <Input type="email" placeholder="john@university.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input placeholder="How can we help you?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message *</label>
                                        <Textarea
                                            placeholder="Please provide as much detail as possible..."
                                            className="min-h-38"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={contactMutation.isPending}>
                                        {contactMutation.isPending ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
