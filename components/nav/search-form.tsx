"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";

export default function SearchForm() {
  const form = useForm();
  const router = useRouter();

  const onSubmit = async ({ searchText }: any) => {
    if (searchText) {
      router.push(`/loggedin/search/${searchText}`);
    }
  };

  return (
    <form
      className="relative w-full"
      onSubmit={form.handleSubmit(onSubmit)}
      role="search"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id="searchText"
        type="search"
        required
        placeholder="Search tasks…"
        className="h-9 w-full border border-transparent bg-secondary/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-border focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        {...form.register("searchText")}
      />
    </form>
  );
}