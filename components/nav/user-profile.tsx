"use client";
import { Settings } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

export default function UserProfile() {
  return (
    <div className="flex min-w-0 items-center gap-2.5 py-1">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-sm font-medium text-foreground">
        TS
      </span>
      <div className="min-w-0 hidden sm:block">
        <p className="truncate text-sm font-medium leading-none">Local workspace</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">No account needed</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-1 h-8 w-8 text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Open settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/loggedin/settings" className="flex w-full items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {`TaskScribe · local single-user workspace`}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}