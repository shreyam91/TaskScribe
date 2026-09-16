"use client";
import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  FolderKanban,
  Inbox,
  Bell,
  Heart,
  Bot,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AREAS = [
  { icon: <Inbox className="h-4 w-4" />, name: "Inbox", desc: "Everything uncategorized, in one clean list." },
  { icon: <Calendar className="h-4 w-4" />, name: "Today", desc: "What's due now — and what slipped." },
  { icon: <CalendarDays className="h-4 w-4" />, name: "Upcoming", desc: "The next days, grouped by date." },

  { icon: <Bell className="h-4 w-4" />, name: "Reminders", desc: "Recurring nudges timed to your day." },
  { icon: <Heart className="h-4 w-4" />, name: "Wellness", desc: "Water and break prompts that keep you going." },
  { icon: <Bot className="h-4 w-4" />, name: "Virtual Me", desc: "A companion that responds as you work." },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-10">
        <span className="font-serif text-xl font-medium tracking-tight">
          TaskScribe
        </span>
        <Button asChild size="sm">
          <Link href="/loggedin">Open app</Link>
        </Button>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-3xl flex-1 px-6 py-24 text-center md:py-28">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-accent">
          A calmer way to work
        </p>
        <h1 className="text-balance font-serif text-4xl font-medium leading-[1.1] tracking-tight md:text-[3.4rem]">
          Write it down,
          <br />
          then get on with it.
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
          TaskScribe is a place to capture what needs doing, see what&apos;s due
          today, and plan the days ahead — without the noise of a full
          project-management suite.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button asChild size="lg">
            <Link href="/loggedin">Open TaskScribe</Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            Runs locally. No account, no sign-up.
          </span>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-5xl border-t border-border" />

      {/* The workspace rail */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 md:px-10">
        <h2 className="max-w-xl font-serif text-3xl font-medium tracking-tight md:text-4xl">
          One calm workspace, seven clear views.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Every screen is a single, focused question. Pick the answer you need
          at the moment.
        </p>
        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <div key={a.name} className="bg-background p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-accent">
                {a.icon}
              </span>
              <h3 className="mt-4 font-serif text-lg font-medium">{a.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {a.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-5xl border-t border-border" />

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 md:px-10">
        <h2 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
          Built around doing, not managing.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          A few simple tools, given room to work well.
        </p>
        <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="Quick capture"
            description="Type a task and press Enter. No categories, no ceremony — just get it out of your head."
          />
          <Feature
            title="Due dates that surface"
            description="Today and overdue sit at the top so the important thing is always the thing you see first."
          />
          <Feature
            title="Projects"
            description="Group related tasks and watch progress fill in as you check things off."
          />
          <Feature
            title="Recurring reminders"
            description="Daily, weekdays, weekly, or every few days. Set it once; the next trigger is calculated for you."
          />
          <Feature
            title="Priorities, not clutter"
            description="A quiet priority marker keeps high and low apart. Nothing loudly in your face."
          />
          <Feature
            title="Good-habit nudges"
            description="Optional water and break prompts, plus a companion character if you'd like the company."
          />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-5xl border-t border-border" />

      {/* How it works */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20 md:px-10">
        <h2 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
          How it works
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          No setup wizard, no onboarding. Just open it and start writing.
        </p>
        <div className="mt-14">
          <Step
            number="1"
            title="Open your inbox"
            description="The inbox holds every task you haven't organized yet — a clean starting point."
          />
          <Step
            number="2"
            title="Write it down, add a date"
            description="Give a task a name, a priority, and a due date. The extra fields stay out of the way until you need them."
          />
          <Step
            number="3"
            title="Check it off"
            description="Completed tasks drop out of the active list but stay recorded. Progress fills in automatically."
          />
        </div>
      </section>

      {/* Privacy note */}
      <section className="mx-auto w-full max-w-5xl border-t border-border px-6 py-20 md:px-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-medium tracking-tight">
              Yours, by default.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              TaskScribe runs as a local, single-user workspace. There&apos;s no
              account, no cloud account to manage, and nothing about your tasks
              is sent anywhere.
            </p>
          </div>
          <ul className="flex flex-col justify-center gap-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 shrink-0 text-accent" /> No sign-up, no sign-in
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 shrink-0 text-accent" /> Your data lives in your own database
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 shrink-0 text-accent" /> Works offline-friendly on a local server
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl border-t border-border px-6 py-20 md:px-10">
        <h2 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
          Questions
        </h2>
        <div className="mt-10">
          <FAQ
            question="Do I need an account?"
            answer="No. TaskScribe is a local, single-user workspace. Point it at your own database and you're done — no accounts, no providers."
          />
          <FAQ
            question="What are reminders?"
            answer="A reminder is a scheduled nudge tied to a task or to nothing at all. You can set one for a specific date and time, or make it repeat daily, on weekdays, weekly, or every few days."
          />
          <FAQ
            question="Is there a mobile app?"
            answer="The web app is responsive and works well on phone and tablet browsers. A desktop companion is planned to sit beside it."
          />
          <FAQ
            question="What is 'Virtual Me'?"
            answer="An optional companion character that responds as you work — a greeting in the morning, a gentle or direct nudge when a reminder fires. It's off by default."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-2xl border-t border-border px-6 py-24 text-center md:px-10">
        <h2 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
          Ready to clear your head?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
          Open the app and write the first thing down.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link href="/loggedin">Open TaskScribe</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-10">
          <div className="flex items-center gap-4">
            <span className="font-serif text-base font-medium">TaskScribe</span>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Local · single-user · your data stays yours
          </span>
        </div>
      </footer>
    </main>
  );
}

/* ── Subcomponents ────────────────────────────────────────── */

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-medium tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 border-t border-border py-8">
      <span className="font-serif text-2xl font-medium text-muted-foreground">{number}</span>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-t border-border py-6">
      <h3 className="text-sm font-medium">{question}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{answer}</p>
    </div>
  );
}