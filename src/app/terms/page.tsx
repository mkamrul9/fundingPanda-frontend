import PublicNavbar from "@/components/ui/layout/PublicNavbar";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicNavbar />
      <main className="container mx-auto flex max-w-4xl flex-1 px-4 py-16">
        <div className="rounded-2xl border bg-white p-8 shadow-sm md:p-12">
          <h1 className="mb-6 text-4xl font-extrabold">Terms of Service</h1>
          <p className="mb-8 text-neutral-500">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 leading-relaxed text-neutral-700">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">1. Acceptance of Terms</h2>
              <p>
                By accessing and using FundingPanda, you accept and agree to be bound by the terms and provision of this agreement.
                In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">2. Funding and Refunds</h2>
              <p>
                FundingPanda acts as a platform to connect sponsors with student researchers. All transactions are final.
                FundingPanda does not guarantee the completion or success of any funded project. Sponsors contribute at their own risk.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">3. User Conduct</h2>
              <p>
                You agree to use the platform only for lawful purposes. You are prohibited from posting or transmitting any unlawful,
                threatening, libelous, defamatory, obscene, scandalous, inflammatory, pornographic, or profane material.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
