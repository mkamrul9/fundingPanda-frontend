import PublicNavbar from "@/components/ui/layout/PublicNavbar";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicNavbar />
      <main className="container mx-auto flex max-w-4xl flex-1 px-4 py-16">
        <div className="rounded-2xl border bg-white p-8 shadow-sm md:p-12">
          <h1 className="mb-6 text-4xl font-extrabold">Privacy Policy</h1>
          <p className="mb-8 text-neutral-500">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 leading-relaxed text-neutral-700">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create an account, update your profile, submit a project,
                or communicate with us. This may include your name, email address, university affiliation, and payment information
                processed securely via Stripe.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to process transactions,
                and to send you related information, including confirmations and receipts.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">3. Information Sharing</h2>
              <p>
                We do not share your personal information with third parties except as necessary to provide our services
                such as sharing payment data with Stripe or to comply with applicable law.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
