"use client";

import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarContent } from "./sidebar";
import { Menu, Search, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Derive initials from name
function getInitials(name: string) {
  if (!name) return "ST";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DashboardHeader() {
  const { user, profile } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const displayRole = profile?.roll_number || (profile?.role === "admin" ? "Admin" : "Student");

  // Close when clicking outside
  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  // Close on Escape
  useEffect(() => {
    if (!notifOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Mobile Drawer + Search */}
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-72 border-r border-sidebar-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search topics, questions, or tests..."
            className="pl-9 h-9 bg-muted/40 border-border/60 text-xs text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-3">
        {/* Notification button + popover */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-border/60 relative"
            aria-label="Open notifications"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Popover */}
          {notifOpen && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border/80 bg-card shadow-2xl shadow-black/30 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">System</span>
              </div>

              {/* Empty state */}
              <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                  <Bell className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground">No new notifications</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Assessment results and system alerts will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <Avatar className="h-9 w-9 border border-indigo-500/30">
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-none">
              {displayName}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {displayRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
