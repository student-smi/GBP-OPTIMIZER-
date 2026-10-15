import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GBP Optimizer — Google Business Profile Audit & Optimization SaaS",
  description:
    "Audit Google Business Profiles, identify ranking and conversion bottlenecks, compute a deterministic 100-point profile health score, and generate actionable optimization tasks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <body className="min-h-screen bg-white font-sans antialiased text-[#111111]">
        {children}
      </body>
    </html>
  );
}
