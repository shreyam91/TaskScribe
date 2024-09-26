"use client";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
// import { api } from "../convex/_generated/api";
import { signInAction } from "@/actions/auth-action";

export default function Home() {
  // const tasks = useQuery(api.tasks.get);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)} */}
      <h1>Task Scribe</h1>
        
      <form action={signInAction}>
        <Button>Login</Button>
      </form>
    </main>
  );
}
