"use client";
import moment from "moment";

import AppShell from "../app-shell";
import PageHeader from "../ui/page-header";
import TaskList from "../todos/task-list";
import { useAllTasks } from "@/lib/api";
import { groupTasksByDay, isOverdue } from "@/lib/task-view";

export default function Upcoming() {
  const { data: tasks, isLoading } = useAllTasks();

  const open = tasks.filter((t) => !t.is_completed);
  const overdue = open.filter((t) => isOverdue(t));
  const groups = groupTasksByDay(open);
  const keys = Object.keys(groups).sort();

  return (
    <AppShell navTitle="Upcoming" navLink="/loggedin/upcoming">
      <PageHeader
        title="Upcoming"
        subtitle="Everything you’ve scheduled, day by day."
      />

      {overdue.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--warning))]">
            Overdue · {overdue.length}
          </h2>
          <TaskList tasks={overdue} projects={projects} />
        </section>
      )}

      {keys.length === 0 ? (
        <div className="border-b border-border py-16 text-center text-sm text-muted-foreground">
          Nothing scheduled. Add a due date to a task to see it here.
        </div>
      ) : (
        keys.map((key) => (
          <section key={key} className="mb-8">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {moment(key, "YYYY-MM-DD").format("dddd, MMMM D")}
            </h2>
            <TaskList tasks={groups[key]} projects={projects} />
          </section>
        ))
      )}
    </AppShell>
  );
}