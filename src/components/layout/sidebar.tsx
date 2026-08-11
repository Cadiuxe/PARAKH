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
  GraduationCap,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export function SidebarContent() {
  const pathname = usePathname();

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
          {mainNavItems.map((item) => {
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

      {/* User Info & Quick Logout stub */}
      <div className="pt-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
              AS
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">Arjun Sharma</span>
              <span className="text-[10px] text-muted-foreground">CS-2026-042</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
