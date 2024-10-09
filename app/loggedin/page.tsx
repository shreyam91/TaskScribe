import MobileNav from "@/components/nav/mobile-nav";
import SideBar from "@/components/nav/side-bar";
// import TodoList from "@/components/todos/todo-list";

import UserProfile from "@/components/nav/user-profile";

export default function Home() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SideBar />
      <div className="flex flex-col">
        <MobileNav />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:px-8">
          {/* <TodoList /> */}

          <h1>Logged In succesfully.......</h1>
          <UserProfile/>
        </main>
      </div>
    </div>
  );
}