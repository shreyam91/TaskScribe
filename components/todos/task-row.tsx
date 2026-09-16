"use client";
import { useState } from "react";
import moment from "moment";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tasksApi, useRefresh } from "@/lib/api";
import { type Task } from "@/lib/api";
import {
  isOverdue,
  priorityTone,
  PriorityLabel,
} from "@/lib/task-view";
import { cn } from "@/lib/utils";
import { Check, MoreHorizontal, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TaskEditDialog from "./task-dialog";

export default function TaskRow({
  task,
}: {
  task: Task;
}) {
  const refresh = useRefresh();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const overdue = isOverdue(task);

  const toggle = async () => {
    setBusy(true);
    try {
      await tasksApi.update(task.id, { is_completed: !task.is_completed });
      refresh();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const setPriority = async (p: number) => {
    try {
      await tasksApi.update(task.id, { priority: p });
      refresh();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };


  const reschedule = async (dateStr: string) => {
    try {
      await tasksApi.update(task.id, { due_date: partsToIso(dateStr) });
      refresh();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await tasksApi.remove(task.id);
      refresh();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };


  return (
    <>
      <div className="group flex items-center gap-3 border-b border-border py-2.5 px-1">
        {/* Checkbox */}
        <button
          onClick={toggle}
          disabled={busy}
          aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "relative flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            task.is_completed
              ? "border-foreground/60 bg-foreground text-background"
              : "border-border bg-background hover:border-foreground/40"
          )}
        >
          {task.is_completed && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm leading-snug",
              task.is_completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {overdue && (
              <span className="text-[hsl(var(--warning))] font-medium">
                Overdue
              </span>
            )}
            {!overdue && task.due_date && (
              <span>
                {moment(task.due_date).format(
                  moment(task.due_date).isSame(moment(), "day")
                    ? "h:mm a"
                    : "MMM D"
                )}
              </span>
            )}
            {task.priority > 0 && (
              <span className="flex items-center gap-1">
                <span
                  className={cn("inline-block h-2 w-2 rounded-full", priorityTone(task.priority))}
                  title={PriorityLabel[task.priority]}
                />
                <span className="hidden sm:inline">{PriorityLabel[task.priority]}</span>
              </span>
            )}

          </div>
        </div>

        {/* Context menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring opacity-0 group-hover:opacity-100"
              aria-label="Task options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {[0, 1, 2, 3, 4].map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => setPriority(p)}
                    className="flex items-center gap-2"
                  >
                    {p > 0 && (
                      <span className={cn("h-2 w-2 rounded-full", priorityTone(p))} />
                    )}
                    {PriorityLabel[p]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Reschedule</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => reschedule(moment().format("YYYY-MM-DD"))}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => reschedule(moment().add(1, "day").format("YYYY-MM-DD"))}>
                  Tomorrow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => reschedule(moment().add(7, "days").format("YYYY-MM-DD"))}>
                  Next week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                  Choose date…
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={remove}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TaskEditDialog
        task={task}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}

/** Build an ISO string from a "YYYY-MM-DD" date value. */
function partsToIso(dateStr: string | null, timeStr?: string): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0).toISOString();
}