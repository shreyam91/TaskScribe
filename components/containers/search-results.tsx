"use client";
import AppShell from "../app-shell";
import PageHeader from "../ui/page-header";
import TaskList from "../todos/task-list";
import { Skeleton } from "../ui/skeleton";
import { useAllTasks } from "@/lib/api";
import { matchQuery } from "@/lib/task-view";

export default function SearchResults({ query }: { query: string }) {
  const { data: tasks, isLoading } = useAllTasks();

  const q = decodeURIComponent(query || "");
  const results = q.trim() ? tasks.filter((t) => matchQuery(t, q.trim())) : [];

  return (
    <AppShell navTitle="Search" navLink="/loggedin/search">
      <PageHeader
        title={q ? `Search results` : "Search"}
        subtitle={q ? `for “${q}” · ${results.length} match${results.length === 1 ? "" : "es"}` : undefined}
      />

      {isLoading ? (
        <div className="space-y-2 py-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : (
        <TaskList
          tasks={results}
          emptyMessage={q ? `No tasks match “${q}”.` : "Type in the search box above to find tasks."}
        />
      )}
    </AppShell>
  );
}