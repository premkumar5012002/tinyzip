"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User2, Sun, Moon, Laptop } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommandSearch } from "@/components/command-search";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export function TopNav() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="sticky top-0 z-10 w-full border-b border-muted-foreground/20 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Left: Sidebar Toggle */}
        <div className="flex items-center">
          <SidebarTrigger />
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center">
          <CommandSearch />
        </div>

        {/* Right: New Button and Account Dropdown */}
        <div className="flex items-center gap-2">
          {/* Account Dropdown */}
          {!mounted || isPending ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <div className="flex bg-accent/50 aspect-square size-8 items-center justify-center rounded-full border">
                    <User2 className="size-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{session.user.name}</p>
                    <p className="w-[200px] truncate text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Laptop className="mr-2 h-4 w-4" />
                        System
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/login");
                        },
                      },
                    });
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <LogIn className="mr-2 size-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
