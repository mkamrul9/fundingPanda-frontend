import Link from "next/link";
import PublicNavbar from "@/components/ui/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";

export default function BulletinComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <PublicNavbar />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-16">
        <div className="app-panel max-w-2xl rounded-2xl p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Newspaper className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-3 text-3xl font-extrabold">Weekly Bulletin</h1>
          <p className="mb-8 text-muted-foreground">Coming soon. We are preparing a richer editorial format for weekly platform highlights.</p>
          <Link href="/newsletter">
            <Button>Back to Updates and News</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
