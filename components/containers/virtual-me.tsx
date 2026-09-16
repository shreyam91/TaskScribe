"use client";
import AppShell from "../app-shell";
import PageHeader from "../ui/page-header";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSettings, settingsApi, useRefresh } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const CHARACTERS = [
  { id: "companion", label: "Companion", blurb: "Warm, steady, a steady hand at your side." },
  { id: "instructor", label: "Instructor", blurb: "Direct and precise. No-nonsense, on your side." },
  { id: "coach", label: "Coach", blurb: "Energizing and motivating, big on momentum." },
];

export default function VirtualMe() {
  const { data: settings, isLoading } = useSettings();
  const refresh = useRefresh();
  const { toast } = useToast();

  if (isLoading || !settings) {
    return (
      <AppShell navTitle="Virtual Me" navLink="/loggedin/virtual-me">
        <Skeleton className="h-10 w-60" />
        <div className="mt-6 space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-24 w-full" /></div>
      </AppShell>
    );
  }

  const prefs = settings.notification_preferences || {};
  const vm = prefs.virtualMe || {};

  const save = (patch: Record<string, any>) =>
    settingsApi.update({ notification_preferences: { ...prefs, virtualMe: { ...vm, ...patch } } })
      .then(() => refresh())
      .catch((e) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }));

  const enabled = !!vm.enabled;
  const character = CHARACTERS.find((c) => c.id === vm.character) || CHARACTERS[0];

  return (
    <AppShell navTitle="Virtual Me" navLink="/loggedin/virtual-me">
      <PageHeader title="Virtual Me" subtitle="A character that responds to you as you work." />

      <div className="space-y-10">
        {/* Character preview */}
        <section className="rounded border border-border bg-secondary/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium">Your companion</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {enabled ? "Active — will keep you company as you plan and work." : "Paused — set to off for now."}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={(v) => save({ enabled: v })}
              aria-label="Enable companion" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center gap-1 rounded-full border border-border bg-background">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/80" />
            </div>
            <div className="min-w-0 max-w-sm flex-1">
              <p className="font-serif text-lg font-medium">{character.label}</p>
              <p className="text-sm text-muted-foreground">{character.blurb}</p>
              <div className="mt-3 rounded border border-border bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">“</span>
                {exampleBubble(character.id, vm.defaultState || "good_morning")}
                <span className="text-muted-foreground">”</span>
              </div>
            </div>
          </div>
        </section>

        {/* Character choice */}
        <Section title="Character">
          <Select value={character.id} onValueChange={(v) => save({ character: v })}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHARACTERS.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        {/* Default state */}
        <Section title="Default state">
          <Select value={vm.defaultState || "good_morning"} onValueChange={(v) => save({ defaultState: v })}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good_morning">Good morning</SelectItem>
              <SelectItem value="focused">Focused on work</SelectItem>
              <SelectItem value="energetic">Energetic start</SelectItem>
              <SelectItem value="calm">Calm and centred</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        {/* Reminder behavior */}
        <Section title="Reminder behavior">
          <Select value={vm.reminderBehavior || "gentle"} onValueChange={(v) => save({ reminderBehavior: v })}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gentle">Gentle nudge</SelectItem>
              <SelectItem value="direct">Direct prompt</SelectItem>
              <SelectItem value="coaching">Coaching push</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        {/* Toggles */}
        <Section title="Presence" description="What the companion does while you work.">
          <div className="space-y-3">
            <ToggleRow title="Animations" desc="Subtle motion in the companion."
              on={!!vm.animations} onChange={(v) => save({ animations: v })} />
            <ToggleRow title="Speech bubbles" desc="Short spoken thoughts on reminders."
              on={!!vm.speech} onChange={(v) => save({ speech: v })} />
            <ToggleRow title="Desktop companion" desc="Float on the desktop beside this app."
              on={!!vm.desktop} onChange={(v) => save({ desktop: v })} />
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border pb-8">
      <h3 className="font-serif text-xl font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ToggleRow({ title, desc, on, onChange }: {
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}

function exampleBubble(character: string, state: string): string {
  const line =
    state === "focused" ? "That focus is paying off — keep going."
    : state === "energetic" ? "Great start. Let’s ride the momentum."
    : state === "calm" ? "One step at a time. We have this."
    : "Morning. Here’s what’s worth your attention today.";
  return character === "instructor"
    ? `Task list ready. Next: ${(line.split(" ")[0].toLowerCase() === "task" ? "your top item." : "the top item.")}`
    : character === "coach"
    ? `Let’s go! ${line}`
    : line;
}