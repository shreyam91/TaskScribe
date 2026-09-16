"use client";
import { useState } from "react";

import AppShell from "../app-shell";
import PageHeader from "../ui/page-header";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings, settingsApi, useRefresh } from "@/lib/api";

export default function Wellness() {
  const { data: settings, isLoading } = useSettings();
  const refresh = useRefresh();
  const { toast } = useToast();

  if (isLoading || !settings) {
    return (
      <AppShell navTitle="Wellness" navLink="/loggedin/wellness">
        <Skeleton className="h-10 w-48" />
        <div className="mt-6 space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
      </AppShell>
    );
  }

  const prefs = settings.notification_preferences || {};
  const wellness = prefs.wellness || {};

  const savePrefs = (patch: Record<string, any>) =>
    settingsApi.update({
      notification_preferences: { ...prefs, wellness: { ...wellness, ...patch } },
    })
      .then(() => refresh())
      .catch((e) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }));

  const waterOn = (settings.water_reminder_interval || 0) > 0;
  const breakOn = (settings.break_reminder_interval || 0) > 0;

  return (
    <AppShell navTitle="Wellness" navLink="/loggedin/wellness">
      <PageHeader title="Wellness" subtitle="Small, healthy nudges to protect your energy through the day." />

      <div className="space-y-10">
        {/* Water */}
        <Tile
          title="Water reminders"
          on={waterOn}
          onToggle={(v) =>
            settingsApi.update({ water_reminder_interval: v ? 60 : 0 })
              .then(() => refresh())
              .catch((e) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }))
          }
          description="A gentle prompt to hydrate at a steady interval."
        >
          {waterOn && (
            <IntervalField
              label="Interval"
              value={settings.water_reminder_interval}
              min={15}
              step={15}
              suffix="min"
              onSave={async (n) => {
                await settingsApi.update({ water_reminder_interval: n });
                refresh();
              }}
            />
          )}
        </Tile>

        {/* Breaks */}
        <Tile
          title="Break reminders"
          on={breakOn}
          onToggle={(v) =>
            settingsApi.update({ break_reminder_interval: v ? 60 : 0 })
              .then(() => refresh())
              .catch((e) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }))
          }
          description="Step away, stretch, and reset."
        >
          {breakOn && (
            <IntervalField
              label="Interval"
              value={settings.break_reminder_interval}
              min={15}
              step={15}
              suffix="min"
              onSave={async (n) => {
                await settingsApi.update({ break_reminder_interval: n });
                refresh();
              }}
            />
          )}
        </Tile>

        {/* Quiet hours */}
        <Tile
          title="Quiet hours"
          on={!!wellness.quiet}
          onToggle={(v) => savePrefs({ quiet: v ? { start: "22:00", end: "08:00" } : null })}
          description="Suppress nudges while you rest."
        >
          {wellness.quiet && (
            <div className="flex items-end gap-3">
              <QuietField
                label="Start"
                value={wellness.quiet.start}
                onSave={(start) => savePrefs({ quiet: { ...wellness.quiet, start } })}
              />
              <QuietField
                label="End"
                value={wellness.quiet.end}
                onSave={(end) => savePrefs({ quiet: { ...wellness.quiet, end } })}
              />
            </div>
          )}
        </Tile>
      </div>
    </AppShell>
  );
}

function Tile({
  title,
  description,
  on,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  on: boolean;
  onToggle: (on: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-border pb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-medium">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch checked={on} onCheckedChange={onToggle} aria-label={`Toggle ${title}`} />
      </div>
      {on && children && <div className="mt-4">{children}</div>}
    </section>
  );
}

function IntervalField({
  label,
  value,
  min,
  step,
  suffix,
  onSave,
}: {
  label: string;
  value: number;
  min: number;
  step: number;
  suffix: string;
  onSave: (n: number) => Promise<void>;
}) {
  const [val, setVal] = useStateText(String(value));
  const save = async () => {
    const n = Math.max(min, parseInt(val, 10) || min);
    await onSave(n);
    setVal(String(n));
  };
  return (
    <div className="flex max-w-xs items-end gap-2">
      <div className="flex-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <Input type="number" min={min} step={step} value={val} onChange={(e) => setVal(e.target.value)} className="w-20" />
      <span className="text-xs text-muted-foreground">{suffix}</span>
      <Button size="sm" variant="secondary" onClick={save}>Set</Button>
    </div>
  );
}

function QuietField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [val, setVal] = useStateText(value);
  return (
    <div className="flex flex-1 items-end gap-2">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <Input type="time" value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val)} className="w-28" />
    </div>
  );
}

function useStateText(initial: string) {
  const [v, setV] = useState(initial);
  return [v, setV] as const;
}