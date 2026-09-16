import type { CompanionEvent } from "./shared";
import type { VirtualMePrefs } from "./api";

/**
 * Short, friendly, non-judgmental lines. Wording deliberately avoids blaming
 * or pressuring the user ("Want to continue?" not "You missed your task.");
 * the only tone variation is by the chosen character, via a couple of
 * alternative lines per event. Keep everything concise.
 */

type Tone = "companion" | "instructor" | "coach";

interface SpeechOptions {
  character?: VirtualMePrefs["character"];
  taskTitle?: string | null;
}

function toneFor(prefs: VirtualMePrefs): Tone {
  return prefs.character ?? "companion";
}

const LINES: Record<CompanionEvent, Record<Tone, (o: SpeechOptions) => string>> = {
  TASK_REMINDER: {
    companion: (o) => (o.taskTitle ? `Time to work on “${o.taskTitle}”.` : "Time to work on your task."),
    instructor: (o) => (o.taskTitle ? `Ready: “${o.taskTitle}”.` : "Your task is ready now."),
    coach: (o) => `Let’s go — ${o.taskTitle ? `“${o.taskTitle}”` : "your next task"} awaits.`,
  },
  TASK_COMPLETED: {
    companion: () => "Nice! Task completed.",
    instructor: () => "Done. On to the next.",
    coach: () => "That’s a win. Keep it rolling!",
  },
  TASK_OVERDUE: {
    companion: () => "This task is still pending. Want to continue?",
    instructor: () => "One task is still waiting. Want to pick it up?",
    coach: () => "No rush — just checking in on that one. Continue?",
  },
  WATER_REMINDER: {
    companion: () => "💧 Time for some water.",
    instructor: () => "Water break. Small sip, quick reset.",
    coach: () => "H2O! Give yourself a sip.",
  },
  BREAK_REMINDER: {
    companion: () => "Take a 5-minute break.",
    instructor: () => "Step away for five minutes. Stretch.",
    coach: () => "Break time! Stand up, breathe, bounce back.",
  },
  USER_IDLE: {
    companion: () => "",
    instructor: () => "",
    coach: () => "",
  },
  USER_RETURNED: {
    companion: () => "Welcome back. Ready to get to it?",
    instructor: () => "Back. Here’s where we left off.",
    coach: () => "There you are! Let’s pick up the pace.",
  },
};

export function messageFor(
  event: CompanionEvent,
  prefs: VirtualMePrefs,
  taskTitle: string | null = null
): string {
  return LINES[event][toneFor(prefs)]({ character: prefs.character, taskTitle });
}