"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarContent } from "./sidebar";
import { Menu, Search, Bell, Sparkles, BrainCircuit } from "lucide-react";
import { MOCK_STUDENT } from "@/lib/mock-data";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Mobile Drawer Trigger & Title */}
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


        {/* Search input placeholder */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search topics, questions, or tests..."
            className="pl-9 h-9 bg-muted/40 border-border/60 text-xs text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right Header Status Actions */}
      <div className="flex items-center gap-3">
        {/* CAT Status Pill */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>CAT Model: <strong>Heuristic Engine v1.0</strong></span>
        </div>

        {/* Notifications */}
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/60 relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
        </Button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <Avatar className="h-9 w-9 border border-indigo-500/30">
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
              AS
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-none">{MOCK_STUDENT.name}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{MOCK_STUDENT.estimatedAbilityLevel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
