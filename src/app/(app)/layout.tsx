import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Suspense } from "react";
import { TopNav } from "@/components/top-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full flex flex-col">
        <Suspense
          fallback={<div className="h-14 border-b bg-background/95 w-full" />}
        >
          <TopNav />
        </Suspense>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
