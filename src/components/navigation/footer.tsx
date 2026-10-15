import React from "react";
import Link from "next/link";
import { BarChart2, ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E5E5E5] bg-white py-10 text-xs text-[#666666]">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-[#111111]">
              <div className="w-6 h-6 rounded bg-[#111111] flex items-center justify-center text-white">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-extrabold">GBP Optimizer</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#777777]">
              Deterministic Google Business Profile audit and local SEO optimization suite.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-2.5">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/features" className="hover:text-[#111111] transition-colors">
                  Features & Rules
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#111111] transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#111111] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-2.5">
              Company
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-[#111111] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#111111] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-2.5">
              Legal
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-[#111111] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#111111] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] flex items-start gap-2.5 text-[11px] leading-relaxed text-[#555555]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#111111] shrink-0 mt-0.5" />
          <p>
            <strong>Search Ranking Disclaimer:</strong> GBP Optimizer is an independent diagnostic and workflow platform. A higher optimization score improves profile health, accuracy, and completeness, but does not guarantee top Google Maps search rankings. Search rankings depend on geographic distance, competition, and Google algorithm updates.
          </p>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5] text-center text-[11px] text-[#888888]">
          © {new Date().getFullYear()} GBP Optimizer SaaS. Minimalist 90% White / 10% Black UI.
        </div>
      </div>
    </footer>
  );
}
