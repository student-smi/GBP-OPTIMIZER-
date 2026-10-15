import React from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#E5E5E5] bg-white px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#777777] uppercase tracking-wider">
              Workspace:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#111111]">
                {user.role === "agency_admin" ? "Agency Hub" : "Active Workspace"}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5]">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/businesses/new">
              <Button size="sm" variant="default" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Business</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
