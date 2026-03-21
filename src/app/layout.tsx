import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FundingPanda | Academic Crowdfunding",
  description: "Bridge the gap between academic research and industry sponsors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Footer />
          <Toaster position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  );
}