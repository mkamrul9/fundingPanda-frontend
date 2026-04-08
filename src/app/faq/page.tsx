"use client";

import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { ChevronDown, CircleHelp } from "lucide-react";

const faqItems = [
  {
    q: "How do I start using FundingPanda as a student?",
    a: "Create an account, complete your profile, then go to Dashboard > Create Project. Add a clear title, description, funding goal, and submit your draft for review.",
  },
  {
    q: "How can sponsors fund a project?",
    a: "Open any approved project from Explore Ideas and click Donate. You will be redirected to secure Stripe checkout. Once payment succeeds, the project raised amount updates automatically.",
  },
  {
    q: "When can sponsors leave reviews?",
    a: "Reviews are enabled after a project is completed. Sponsors who participated can then leave ratings and feedback on the student profile/project context.",
  },
  {
    q: "What is the Resource Hub and how do claims work?",
    a: "Sponsors can list hardware or software resources. Students can claim available resources for active project work. Claimed and listed items are tracked in Dashboard > My Items.",
  },
  {
    q: "How do I message another user on the platform?",
    a: "Go to Dashboard > Messages. You can start a chat from user/project pages. Real-time chat supports text and image attachments once connected.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <PublicNavbar />

      <main className="container mx-auto flex max-w-4xl flex-1 px-4 py-16">
        <div className="app-panel w-full rounded-2xl p-8 shadow-sm md:p-12">
          <div className="mb-8">
            <h1 className="mb-3 flex items-center gap-2 text-4xl font-extrabold text-neutral-900">
              <CircleHelp className="h-9 w-9 text-primary" /> Help Center / FAQ
            </h1>
            <p className="text-neutral-600">Quick answers to the most common questions about using FundingPanda.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details key={index} className="group rounded-xl border bg-neutral-50/75 p-4 open:bg-white open:shadow-sm dark:bg-muted/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-neutral-900">
                  <span>{item.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
