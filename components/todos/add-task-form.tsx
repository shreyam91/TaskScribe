"use client";
import { useState, useEffect } from "react";
import * as chrono from "chrono-node";
import moment from "moment";

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
import { tasksApi, remindersApi, useRefresh } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Plus } from "lucide-react";

export default function AddTaskForm() {
  const refresh = useRefresh();
  const { toast } = useToast();

  const [naturalInput, setNaturalInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("0");
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [busy, setBusy] = useState(false);

  // Parse natural language as the user types
  useEffect(() => {
    if (!naturalInput.trim()) {
      setTitle("");
      setDateVal("");
      setTimeVal("");
      return;
    }

    const parsed = chrono.parse(naturalInput);
    if (parsed.length > 0) {
      const p = parsed[0];
      const parsedDate = p.start.date();

      // Extract the title by removing the matched date string
      const matchedText = p.text;
      const strippedTitle = naturalInput.replace(matchedText, "").trim();

      setTitle(strippedTitle || matchedText);
      setDateVal(moment(parsedDate).format("YYYY-MM-DD"));

      if (p.start.isCertain("hour")) {
        setTimeVal(moment(parsedDate).format("HH:mm"));
      } else {
        setTimeVal("");
      }
    } else {
      setTitle(naturalInput);
      setDateVal("");
      setTimeVal("");
    }
  }, [naturalInput]);

  const save = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setBusy(true);
    try {
      let isoDate: string | null = null;
      if (dateVal) {
        const [y, m, d] = dateVal.split("-").map(Number);
        const [hh, mm] = (timeVal || "00:00").split(":").map(Number);
        isoDate = new Date(y, m - 1, d, hh || 0, mm || 0).toISOString();
      }

      // Create Task
      const task = await tasksApi.create({
        title: trimmedTitle,
        description: description.trim() || null,
        priority: Number(priority),
        due_date: isoDate,
      });

      // Create Reminder if recurrence is selected or if it has a due date
      if (recurrence !== "none" || isoDate) {
        await remindersApi.create({
          task_id: task.id,
          trigger_type: recurrence === "none" ? "one_time" : "recurring",
          recurrence_pattern: recurrence !== "none" ? recurrence : null,
          next_trigger_at: isoDate || new Date().toISOString(),
          is_enabled: true,
        });
      }

      refresh();
      setNaturalInput("");
      setDescription("");
      setPriority("0");
      setRecurrence("none");
      setDateVal("");
      setTimeVal("");
      toast({ title: "Task added successfully" });
    } catch (err: any) {
      toast({
        title: "Could not add task",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-muted-foreground">
          What needs to be done?
        </label>
        <Input
          value={naturalInput}
          onChange={(e) => setNaturalInput(e.target.value)}
          placeholder="e.g. Read emails tomorrow at 10am"
          className="text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            }
          }}
        />
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarIcon className="h-3 w-3" />
          <span>Natural language parsing is active. Type a date or time!</span>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Date
            </label>
            <Input
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Time
            </label>
            <Input
              type="time"
              value={timeVal}
              onChange={(e) => setTimeVal(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Priority
            </label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-9">
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

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Recurrence
            </label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={save} disabled={!naturalInput.trim() || busy}>
          <Plus className="mr-2 h-4 w-4" />
          {busy ? "Adding..." : "Add Task"}
        </Button>
      </div>
    </div>
  );
}
