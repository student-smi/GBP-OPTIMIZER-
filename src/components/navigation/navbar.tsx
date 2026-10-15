"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BarChart2, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E5E5] bg-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight text-[#111111]">
          <div className="w-7 h-7 rounded-lg bg-[#111111] flex items-center justify-center text-white">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-[#111111] tracking-tight">
            GBP Optimizer
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#666666]">
          <Link href="/features" className="hover:text-[#111111] transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-[#111111] transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-[#111111] transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#111111] transition-colors">
            Contact
          </Link>
        </nav>

        {/* Auth CTA Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="default" size="sm" className="gap-1.5">
              <span>Start Free Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-[#111111]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E5E5] bg-white px-4 py-5 space-y-4">
          <div className="flex flex-col space-y-2.5 text-sm font-semibold text-[#111111]">
            <Link href="/features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </div>
          <div className="pt-3 border-t border-[#E5E5E5] flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Log In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="default" className="w-full">
                Start Free Audit
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
