"use client";
import { Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { primaryNavItems } from "@/utils";
import UserProfile from "./user-profile";
import ThemeToggle from "./theme-toggle";
import SearchForm from "./search-form";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MobileNav({
  navTitle = "TaskScribe",
  navLink = "/loggedin",
}: {
  navTitle?: string;
  navLink?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <UserProfile />
              <ThemeToggle />
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-0.5">
                {primaryNavItems
                  .map((item) => (
                    <Link
                      key={item.link}
                      href={item.link}
                      className={cn(
                        "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
                        pathname === item.link
                          ? "bg-secondary font-medium text-foreground"
                          : "text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <span className="text-foreground/40">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href={navLink} className="font-serif text-base font-medium">
          {navTitle}
        </Link>
      </div>

      
      <div className="flex w-full max-w-xs flex-1 md:max-w-sm">
              <ThemeToggle />
        <SearchForm />
      </div>
    </header>
  );
}