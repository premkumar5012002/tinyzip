import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Suspense } from "react";
import { TopNav } from "@/components/top-nav";
import { UploadProgressProvider } from "@/context/upload-progress-context";
import { UploadProgressPopover } from "@/components/upload-progress-popover";

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
        <UploadProgressProvider>
          <div className="p-4">{children}</div>
          <UploadProgressPopover />
        </UploadProgressProvider>
      </main>
    </SidebarProvider>
  );
}
