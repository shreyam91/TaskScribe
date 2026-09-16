"use client";
import moment from "moment";

import AppShell from "../app-shell";
import PageHeader from "../ui/page-header";
import TaskList from "../todos/task-list";
import AddTaskForm from "../todos/add-task-form";
import { Skeleton } from "../ui/skeleton";
import { useAllTasks } from "@/lib/api";
import { groupTasksByDay } from "@/lib/task-view";

export default function Dashboard() {
  const { data: tasks, isLoading } = useAllTasks();

  const open = tasks.filter((t) => !t.is_completed);
  // Dashboard groups all tasks by their due date.
  const groups = groupTasksByDay(open);
  const groupKeys = Object.keys(groups).sort();

  return (
    <AppShell navTitle="Dashboard" navLink="/loggedin">
      <PageHeader
        title="Dashboard"
        subtitle="Manage your tasks and schedule."
      />

      <div className="mb-8 mt-2">
        <AddTaskForm />
      </div>

      {isLoading ? (
        <div className="space-y-2 py-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : groupKeys.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No pending tasks. You&apos;re all caught up!
        </div>
      ) : (
        groupKeys.map((key) => (
          <section key={key} className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {key === "no-date" ? "No Date" : moment(key, "YYYY-MM-DD").format(
                moment(key, "YYYY-MM-DD").isSame(moment(), "day")
                  ? "Today"
                  : "ddd, MMM D"
              )}
            </h2>
            <TaskList tasks={groups[key]} />
          </section>
        ))
      )}
    </AppShell>
  );
}