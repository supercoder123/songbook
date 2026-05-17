"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ListMusic, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/songs/new", label: "New Song", icon: Plus },
  { href: "/sets", label: "Setlists", icon: ListMusic },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPerformance =
    pathname.includes("/perform") || pathname.includes("/view");

  if (isPerformance) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 flex-col border-r border-border bg-card/50 p-4 md:flex">
        <Link href="/library" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Songbook</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/library" &&
                pathname.startsWith(item.href.replace("/new", "")));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-amber-500/15 text-amber-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 backdrop-blur md:hidden">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href.split("/new")[0]);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs",
                  active ? "text-amber-500" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}