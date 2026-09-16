"use client";
import moment from "moment";

import AppShell from "../app-shell";
import PageHeader from "../ui/page-header";
import TaskList from "../todos/task-list";
import AddTaskForm from "../todos/add-task-form";
import { Skeleton } from "../ui/skeleton";
import { useAllTasks, useReminders } from "@/lib/api";
import { partitionToday, progress } from "@/lib/task-view";
import { cn } from "@/lib/utils";

export default function Today() {
  const { data: tasks, isLoading } = useAllTasks();
  const { data: reminders } = useReminders({ due: true });

  const now = moment();
  const { overdue, today, upcoming } = partitionToday(tasks, now);
  const done = tasks.filter((t) => t.is_completed).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const dueReminders = (reminders || []).filter((r) => r.is_enabled);

  return (
    <AppShell navTitle="Today" navLink="/loggedin/today">
      <PageHeader
        title="Today"
        subtitle={now.format("dddd, MMMM D")}
        actions={
          <div className="hidden items-center gap-3 text-sm text-muted-foreground sm:flex">
            <span>
              {done} of {tasks.length} done
            </span>
            <span className="h-1.5 w-28 overflow-hidden rounded bg-secondary">
              <span
                className="block h-full bg-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </span>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2 py-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--warning))]">
                Overdue · {overdue.length}
              </h2>
              <TaskList tasks={overdue} />
            </section>
          )}
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Due today
            </h2>
            <TaskList
              tasks={today}
              hideEmpty={today.length > 0}
            />
          </section>
        </>
      )}

      <div className={cn("mt-10", overdue.length > 0 && "mt-6")}>
        <AddTaskForm />
      </div>

      {upcoming.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Later this week
          </h2>
          <TaskList tasks={upcoming.slice(0, 5)} />
        </section>
      )}

      {dueReminders.length > 0 && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reminders active
          </h2>
          <ul className="space-y-2 text-sm">
            {dueReminders.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {r.task_title || "Standalone reminder"}
                {r.next_trigger_at ? (
                  <span className="text-xs">
                    {moment(r.next_trigger_at).format("h:mm a")}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}