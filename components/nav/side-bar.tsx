"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNavItems } from "@/utils";
import UserProfile from "./user-profile";
import ThemeToggle from "./theme-toggle";
import { cn } from "@/lib/utils";

export default function SideBar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r border-border bg-card md:flex md:flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
        <Link href="/loggedin" className="font-serif text-lg font-medium tracking-tight">
          TaskScribe
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-0.5">
          {primaryNavItems
            .map((item) => (
              <NavItem
                key={item.link}
                name={item.name}
                icon={item.icon}
                link={item.link}
                active={isActive(pathname, item.link)}
              />
            ))}
        </div>
      </nav>

    </div>
  );
}

function NavItem({
  name,
  icon,
  link,
  active,
}: {
  name: string;
  icon?: React.ReactNode;
  link: string;
  active: boolean;
}) {
  return (
    <Link
      href={link}
      className={cn(
        "relative flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
        active
          ? "bg-secondary font-medium text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      {active && <span className="absolute -left-4 top-0 h-full w-0.5 bg-accent" />}
      <span className={cn("transition-colors", active ? "text-accent" : "text-foreground/40")}>
        {icon}
      </span>
      <span className="truncate">{name}</span>
    </Link>
  );
}

function isActive(pathname: string, link: string) {
  // Primary items match exactly (except the pages that live directly at /loggedin).
  return pathname === link;
}
