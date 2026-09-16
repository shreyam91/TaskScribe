"use client";
import moment from "moment-timezone";
import Link from "next/link";
import { Lock, Globe, Heart, Bot, ChevronRight } from "lucide-react";

import AppShell from "../app-shell";
import PageHeader from "../ui/page-header";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSettings, settingsApi, useRefresh } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import ThemeToggle from "../nav/theme-toggle";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const refresh = useRefresh();
  const { toast } = useToast();

  if (isLoading || !settings) {
    return (
      <AppShell navTitle="Settings" navLink="/loggedin/settings">
        <Skeleton className="h-10 w-44" />
        <div className="mt-6 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
      </AppShell>
    );
  }

  const prefs = settings.notification_preferences || {};
  const setTimezone = (tz: string) =>
    settingsApi.update({ timezone: tz })
      .then(() => refresh())
      .catch((e) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }));

  const tzNow = moment().tz(settings.timezone || "UTC").format("h:mm a (z)");

  return (
    <AppShell navTitle="Settings" navLink="/loggedin/settings">
      <PageHeader title="Settings" subtitle="How TaskScribe behaves, schedules, and presents itself." />

      <div className="space-y-10">
        {/* Timezone */}
        <section className="border-b border-border pb-8">
          <h3 className="flex items-center gap-2 font-serif text-xl font-medium">
            <Globe className="h-4 w-4 text-muted-foreground" /> Timezone
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Recurring reminders and “today” boundaries are computed in this zone.
          </p>
          <div className="mt-4 flex max-w-sm items-center gap-3">
            <Select value={settings.timezone || "UTC"} onValueChange={setTimezone}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{tzNow}</span>
          </div>
        </section>

        {/* Appearance */}
        <AppearanceSection />

        {/* Linked settings */}
        <section className="border-b border-border pb-8">
          <h3 className="font-serif text-xl font-medium">Linked settings</h3>
          <p className="mt-1 text-sm text-muted-foreground">Quick status of the other areas.</p>
          <div className="mt-4 space-y-3">
            <LinkRow
              href="/loggedin/wellness"
              icon={<Heart className="h-4 w-4" />}
              title="Wellness"
              desc={(settings.water_reminder_interval || 0) > 0 ? "Water reminders on" : "Water and break nudges off"}
            />
            <LinkRow
              href="/loggedin/virtual-me"
              icon={<Bot className="h-4 w-4" />}
              title="Virtual Me"
              desc={prefs.virtualMe?.enabled ? "Companion active" : "Companion paused"}
            />
          </div>
        </section>

        <section className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Single-user local workspace — no account, no cloud. Your data lives in your own database.
        </section>
      </div>
    </AppShell>
  );
}

function AppearanceSection() {
  return (
    <section className="border-b border-border pb-8">
      <h3 className="font-serif text-xl font-medium">Appearance</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Switch between light and dark from here or the sidebar.
      </p>
      <div className="mt-4 flex max-w-sm items-center justify-between rounded border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Theme</p>
          <p className="text-xs text-muted-foreground">Toggles both this screen and the rest of the app.</p>
        </div>
        <ThemeToggle />
      </div>
    </section>
  );
}

function LinkRow({ href, icon, title, desc }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded border border-border px-4 py-3 transition-colors hover:bg-secondary/40"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{desc}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}