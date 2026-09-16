import SideBar from "@/components/nav/side-bar";
import MobileNav from "@/components/nav/mobile-nav";

export default function AppShell({
  children,
  navTitle = "",
  navLink = "#",
}: {
  children: React.ReactNode;
  navTitle?: string;
  navLink?: string;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
      <SideBar />
      <div className="flex min-w-0 flex-col">
        <MobileNav navTitle={navTitle} navLink={navLink} />
        <main className="flex flex-1 flex-col px-5 py-8 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}