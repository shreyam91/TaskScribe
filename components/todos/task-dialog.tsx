"use client";
import { useEffect, useState } from "react";
import moment from "moment";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tasksApi, useRefresh } from "@/lib/api";
import { type Task } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function TaskEditDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const refresh = useRefresh();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState("0");
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? "");

      setPriority(String(task.priority));
      if (task.due_date) {
        setDateVal(moment(task.due_date).format("YYYY-MM-DD"));
        const m = moment(task.due_date);
        setTimeVal(m.hour() || m.minute() ? m.format("HH:mm") : "");
      } else {
        setDateVal("");
        setTimeVal("");
      }
    }
  }, [open, task]);

  const save = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const due_date = dateVal
        ? (() => {
            const [y, m, d] = dateVal.split("-").map(Number);
            const [hh, mm] = (timeVal || "00:00").split(":").map(Number);
            return new Date(y, m - 1, d, hh || 0, mm || 0).toISOString();
          })()
        : null;
      await tasksApi.update(task.id, {
        title: trimmed,
        description: description.trim() || null,

        priority: Number(priority),
        due_date,
      });
      refresh();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Could not save task", description: err?.message, variant: "destructive", duration: 3000 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update the task details below.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-6 py-5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                  <SelectItem value="4">No rush</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Due date</label>
              <Input
                type="date"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
              />
            </div>
            {dateVal && (
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</label>
                <Input
                  type="time"
                  value={timeVal}
                  onChange={(e) => setTimeVal(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!title.trim() || busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}