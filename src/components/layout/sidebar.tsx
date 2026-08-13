"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  LayoutDashboard,
  FileCheck2,
  LineChart,
  Settings,
  ShieldAlert,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Assessments",
    href: "/assessment",
    icon: FileCheck2,
  },
  {
    title: "Analytics & Results",
    href: "/results",
    icon: LineChart,
  },
  {
    title: "Admin Review Queue",
    href: "/admin",
    icon: ShieldAlert,
    badge: "Review Queue",
  },
];

export const secondaryNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Docs",
    href: "/help",
    icon: HelpCircle,
  },
];

function getInitials(name: string) {
  if (!name) return "ST";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SidebarContent() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const displayId = profile?.roll_number || user?.email || "Student";

  const visibleNavItems = mainNavItems.filter((item) => {
    if (item.href === "/admin") {
      return profile?.role === "admin";
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col justify-between p-4 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="space-y-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">PARAKH</span>
            <span className="text-[10px] text-muted-foreground -mt-1 uppercase tracking-wider">Adaptive CAT Platform</span>
          </div>
        </Link>

        {/* Primary Nav */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Navigation
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-muted-foreground"}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Nav */}
        <div className="space-y-1 pt-4 border-t border-sidebar-border">
          <div className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            System
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Info & Logout button */}
      <div className="pt-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
              {getInitials(displayName)}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-foreground truncate">{displayName}</span>
              <span className="text-[10px] text-muted-foreground truncate">{displayId}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            title="Sign Out"
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
