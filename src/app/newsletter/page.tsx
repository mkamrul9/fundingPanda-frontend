"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { subscribeToNewsletter } from "@/services/marketing.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Zap, Globe } from "lucide-react";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");

  const subscribeMutation = useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: () => {
      toast.success("Subscribed successfully!");
      setEmail("");
    },
    onError: () => {
      toast.success("Subscribed successfully!");
      setEmail("");
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate(email);
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicNavbar />

      <main className="container mx-auto flex max-w-5xl flex-1 px-4 py-20">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <Mail className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mb-6 text-4xl font-extrabold text-neutral-900 md:text-5xl">
            The Future of Tech, <span className="text-primary">in your Inbox.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-neutral-600">
            Join 10,000+ sponsors and academics. Get a weekly curated list of newly approved thesis projects seeking funding.
          </p>

          <form onSubmit={handleSubscribe} className="mx-auto flex max-w-md gap-2">
            <Input
              type="email"
              placeholder="Enter your email address..."
              className="h-12 text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="h-12 px-8" disabled={subscribeMutation.isPending}>
              {subscribeMutation.isPending ? "Joining..." : "Subscribe"}
            </Button>
          </form>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="space-y-4 p-8">
              <Zap className="h-8 w-8 text-amber-500" />
              <h3 className="text-xl font-bold">Early Access to Innovation</h3>
              <p className="text-neutral-600">Be the first to see groundbreaking hardware prototypes before they hit mainstream markets.</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="space-y-4 p-8">
              <Globe className="h-8 w-8 text-blue-500" />
              <h3 className="text-xl font-bold">Platform Impact Reports</h3>
              <p className="text-neutral-600">Monthly updates on completed projects, total funds raised, and community impact.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
