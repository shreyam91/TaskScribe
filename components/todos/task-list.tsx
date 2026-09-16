"use client";
import { Inbox } from "lucide-react";

import { type Task } from "@/lib/api";
import TaskRow from "./task-row";

export default function TaskList({
  tasks,
  hideEmpty = false,
}: {
  tasks: Task[];
  hideEmpty?: boolean;
}) {
  if (tasks.length === 0 && !hideEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center text-sm">
        <Inbox className="mb-4 h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">No tasks here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </div>
  );
}