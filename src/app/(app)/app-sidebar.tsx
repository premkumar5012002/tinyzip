"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Settings } from "lucide-react";
import { UsageBar } from "@/components/sidebar/usage-bar";
import { authClient } from "@/lib/auth/client";

export function AppSidebar() {
  const pathname = usePathname();
  authClient.useSession();

  return (
    <Sidebar className="border-r-0 bg-sidebar/50">
      <SidebarHeader className="p-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1">
              <Image
                src="/tinyzip.svg"
                alt="Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">
                  TinyZip
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  className="data-[active=true]:bg-accent data-[active=true]:text-foreground font-medium"
                >
                  <Link href="/">
                    <LayoutDashboard
                      className={
                        pathname === "/"
                          ? "text-primary fill-primary/10"
                          : "text-muted-foreground"
                      }
                    />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/settings"}
                  className="data-[active=true]:bg-accent data-[active=true]:text-foreground font-medium"
                >
                  <Link href="/settings">
                    <Settings
                      className={
                        pathname === "/settings"
                          ? "text-primary fill-primary/10"
                          : "text-muted-foreground"
                      }
                    />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pt-0 gap-4">
        <UsageBar />
      </SidebarFooter>
    </Sidebar>
  );
}
