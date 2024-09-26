"use client";
import UserProfile from "@/components/taskscribe/user-profile";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Task Scribe powered with AI</h1>
        <UserProfile/>
      <Button>Ghost button</Button>
      
    </main>
  );
}
