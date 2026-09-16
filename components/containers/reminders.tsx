"use client";
import { useEffect, useState } from "react";
import moment from "moment";
import { Bell, BellPlus, BellOff } from "lucide-react";

import AppShell from "../app-shell";
import PageHeader from "../ui/page-header";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { remindersApi, useAllTasks, useRefresh, useReminders } from "@/lib/api";
import { type Reminder } from "@/lib/api";
import { recurrenceLabel, type RecurrenceKind } from "@/lib/task-utils";
import { useToast } from "@/components/ui/use-toast";
import { MoreHorizontal, Trash2, Clock, Power } from "lucide-react";

export default function Reminders() {
  const { data: reminders } = useReminders();
  const { data: tasks } = useAllTasks();
  const refresh = useRefresh();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const setEnabled = async (r: Reminder, enabled: boolean) => {
    try {
      await remindersApi.update(r.id, { is_enabled: enabled });
      refresh();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const snooze = async (r: Reminder, minutes: 10 | 30 | 60) => {
    setBusyId(r.id);
    try {
      await remindersApi.snooze(r.id, { minutes });
      refresh();
      toast({ title: `Snoozed for ${minutes} min`, duration: 1500 });
    } catch {
      toast({ title: "Could not snooze", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (r: Reminder) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await remindersApi.remove(r.id);
      refresh();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const active = reminders.filter((r) => r.is_enabled && r.state !== "completed");
  const inactive = reminders.filter((r) => !r.is_enabled || r.state === "completed");

  return (
    <AppShell navTitle="Reminders" navLink="/loggedin/reminders">
      <PageHeader
        title="Reminders"
        subtitle="The engine nudges you when it’s time."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <BellPlus className="mr-2 h-4 w-4" /> New reminder
          </Button>
        }
      />

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="mb-4 text-sm text-muted-foreground">
            No reminders yet. Create one to be nudged at the right time.
          </p>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <BellPlus className="mr-2 h-4 w-4" /> New reminder
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active
              </h2>
              <ReminderList
                reminders={active}
                tasks={tasks}
                busyId={busyId}
                onToggle={setEnabled}
                onSnooze={snooze}
                onDelete={remove}
              />
            </section>
          )}
          {inactive.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Paused & done
              </h2>
              <ReminderList
                reminders={inactive}
                tasks={tasks}
                busyId={busyId}
                onToggle={setEnabled}
                onSnooze={snooze}
                onDelete={remove}
              />
            </section>
          )}
        </div>
      )}

      <ReminderCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tasks={tasks}
      />
    </AppShell>
  );
}

function ReminderList({
  reminders,
  tasks,
  busyId,
  onToggle,
  onSnooze,
  onDelete,
}: {
  reminders: Reminder[];
  tasks: ReturnType<typeof useAllTasks>["data"];
  busyId: string | null;
  onToggle: (r: Reminder, enabled: boolean) => Promise<void>;
  onSnooze: (r: Reminder, minutes: 10 | 30 | 60) => Promise<void>;
  onDelete: (r: Reminder) => Promise<void>;
}) {
  if (reminders.length === 0) return null;
  return (
    <div>
      {reminders.map((r) => {
        const inPast = r.next_trigger_at && moment(r.next_trigger_at).isBefore(moment());
        return (
          <div key={r.id} className="flex items-center gap-3 border-b border-border py-3">
            <button
              onClick={() => onToggle(r, !r.is_enabled)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={r.is_enabled ? "Pause" : "Enable"}
            >
              {r.is_enabled ? <Power className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                {r.task_title || "Standalone reminder"}
              </p>
              <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {r.next_trigger_at
                    ? moment(r.next_trigger_at).format("MMM D, YYYY · h:mm a")
                    : "No upcoming trigger"}
                </span>
                <span className="capitalize">{recurrenceLabel(r.recurrence_pattern)}</span>
                {r.state === "snoozed" && (
                  <span className="text-[hsl(var(--warning))] font-medium">Snoozed</span>
                )}
                {inPast && r.is_enabled && (
                  <span className="font-medium text-[hsl(var(--warning))]">Due now</span>
                )}
              </p>
            </div>
            <Switch
              checked={r.is_enabled}
              onCheckedChange={(v) => onToggle(r, v)}
              aria-label="Enabled"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {r.is_enabled && (
                  <>
                    <DropdownMenuItem disabled={busyId === r.id} onClick={() => onSnooze(r, 10)}>
                      Snooze 10 min
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={busyId === r.id} onClick={() => onSnooze(r, 30)}>
                      Snooze 30 min
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={busyId === r.id} onClick={() => onSnooze(r, 60)}>
                      Snooze 1 hour
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggle(r, false)}>Pause</DropdownMenuItem>
                  </>
                )}
                {!r.is_enabled && (
                  <DropdownMenuItem onClick={() => onToggle(r, true)}>Enable</DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(r)}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}

function ReminderCreateDialog({
  open,
  onOpenChange,
  tasks,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: ReturnType<typeof useAllTasks>["data"];
}) {
  const refresh = useRefresh();
  const { toast } = useToast();
  const [taskId, setTaskId] = useState("__none__");
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("09:00");
  const [kind, setKind] = useState<RecurrenceKind>("none");
  const [every, setEvery] = useState("3");
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setDateVal(moment().format("YYYY-MM-DD"));
      setTimeVal("09:00");
      setKind("none");
      setTaskId("__none__");
      setEnabled(true);
    }
  }, [open]);

  const save = async () => {
    if (!dateVal) return;
    setBusy(true);
    try {
      const [y, m, d] = dateVal.split("-").map(Number);
      const [hh, mm] = timeVal.split(":").map(Number);
      const next_trigger_at = new Date(y, m - 1, d, hh || 0, mm || 0).toISOString();
      const isRecurring = kind !== "none";
      const pattern = isRecurring
        ? kind === "custom"
          ? String(Math.max(1, parseInt(every, 10) || 1))
          : kind
        : null;
      await remindersApi.create({
        task_id: taskId === "__none__" ? null : taskId,
        trigger_type: isRecurring ? "recurring" : "one_time",
        recurrence_pattern: pattern,
        next_trigger_at,
        is_enabled: enabled,
      });
      refresh();
      onOpenChange(false);
      toast({ title: "Reminder created", duration: 2000 });
    } catch (err: any) {
      toast({ title: "Could not create reminder", description: err?.message, variant: "destructive", duration: 3000 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New reminder</DialogTitle>
          <DialogDescription>Pick when, how often, and whether it’s on right away.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">For task</label>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Standalone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Standalone (no task)</SelectItem>
                {tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</label>
              <Input type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</label>
              <Input type="time" value={timeVal} onChange={(e) => setTimeVal(e.target.value)} />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Repeat</label>
              <Select value={kind} onValueChange={(v) => setKind(v as RecurrenceKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (one-time)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom (every N days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {kind === "custom" && (
              <div className="flex w-28 flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Every (days)</label>
                <Input type="number" min={1} value={every} onChange={(e) => setEvery(e.target.value)} />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between rounded border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Enable immediately</p>
              <p className="text-xs text-muted-foreground">Turns on the moment you save.</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!dateVal || busy}>
            {busy ? "Saving…" : "Create reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}