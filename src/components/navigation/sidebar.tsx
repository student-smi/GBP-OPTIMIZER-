"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileSearch,
  CheckSquare,
  Sparkles,
  Printer,
  Users,
  Key,
  Settings,
  LogOut,
  BarChart2,
} from "lucide-react";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
    workspaceId?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Businesses",
      href: "/businesses",
      icon: Building2,
    },
    {
      label: "Audits",
      href: "/audits",
      icon: FileSearch,
    },
    {
      label: "Recommendations",
      href: "/recommendations",
      icon: CheckSquare,
    },
    {
      label: "AI Studio",
      href: "/ai-studio",
      icon: Sparkles,
      badge: "AI",
    },
    {
      label: "Reports",
      href: "/reports",
      icon: Printer,
    },
    {
      label: "Clients",
      href: "/clients",
      icon: Users,
    },
    {
      label: "Integrations",
      href: "/integrations",
      icon: Key,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-60 border-r border-[#E5E5E5] bg-white flex flex-col justify-between h-screen sticky top-0 shrink-0">
      {/* Top Branding */}
      <div>
        <div className="p-4 border-b border-[#E5E5E5]">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-[#111111]">
            <div className="w-7 h-7 rounded-lg bg-[#111111] flex items-center justify-center text-white">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-black text-[#111111] tracking-tight block leading-none">
                GBP Optimizer
              </span>
              <span className="text-[10px] text-[#777777] uppercase font-medium">
                Audit Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <div className="p-2.5 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#111111] text-white font-semibold"
                    : "text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#666666]"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isActive ? "bg-white/20 text-white" : "bg-[#F0F0F0] text-[#111111]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-[#E5E5E5] bg-white">
        <div className="p-2.5 rounded-lg border border-[#E5E5E5] bg-white space-y-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#111111] text-white font-bold flex items-center justify-center text-xs shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#111111] truncate">
                {currentUser?.name || "Demo User"}
              </div>
              <div className="text-[10px] text-[#777777] truncate">
                {currentUser?.email || "demo@gbpoptimizer.com"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3 h-3" />
            <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
