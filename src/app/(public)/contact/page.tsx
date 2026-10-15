"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { Mail, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 space-y-12 py-12">
        <section className="container mx-auto max-w-4xl px-4 text-center space-y-3">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-widest">
            Support & Inquiries
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            Get in Touch with Our Team
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Questions regarding our audit engine, agency workspaces, or API integration roadmap? We are here to help.
          </p>
        </section>

        <section className="container mx-auto max-w-xl px-4">
          <Card className="border-border/80 shadow-md">
            <CardContent className="p-8">
              {submitted ? (
                <div className="p-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#111111] mx-auto" />
                  <h3 className="text-lg font-bold text-foreground">Message Dispatched</h3>
                  <p className="text-xs text-muted-foreground">
                    Thank you, {form.name}. Our technical support team will respond to {form.email} within 24 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can our local SEO audit platform assist your team?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <Button type="submit" variant="default" className="w-full gap-2">
                    <span>Send Message</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
