import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

/**
 * A deliberately tiny JSON settings file in the app's user-data directory.
 * Used for the few companion-local preferences the TaskScribe backend does
 * not already hold (window position, start-at-login, notification toggles).
 * electron-store is intentionally not used: it is ESM-only and heavier than
 * this ~25-line store needs to be.
 */

export interface LocalSettings {
  /** Last window position (docked / dragged). */
  position: { x: number; y: number } | null;
  /** Master switch for OS notifications from reminders. */
  notifications: boolean;
  /** Appear as a companion when a reminder fires (vs. notification only). */
  showForNotifications: boolean;
  /** System idle (seconds) before the companion is considered sleeping. */
  idleThresholdSeconds: number;
}

const DEFAULTS: LocalSettings = {
  position: null,
  notifications: true,
  showForNotifications: true,
  idleThresholdSeconds: 300, // 5 minutes
};

let cache: LocalSettings | null = null;
const file = () => path.join(app.getPath("userData"), "companion-settings.json");

function load(): LocalSettings {
  if (cache) return cache;
  try {
    const raw = JSON.parse(fs.readFileSync(file(), "utf8"));
    cache = { ...DEFAULTS, ...raw };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache!;
}

function save(settings: LocalSettings) {
  cache = settings;
  try {
    fs.mkdirSync(path.dirname(file()), { recursive: true });
    fs.writeFileSync(file(), JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error("Failed to save companion settings", err);
  }
}

export const localSettings = {
  get(): LocalSettings {
    return load();
  },
  update(patch: Partial<LocalSettings>): LocalSettings {
    const next = { ...load(), ...patch };
    save(next);
    return next;
  },
};