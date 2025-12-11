import { auth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/format";
import { FileIcon, FolderIcon, HardDriveIcon } from "lucide-react";

export const metadata = {
  title: "Usage - Tinyzip",
};

export default async function UsagePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  // Fetch stats
  const fileStats = await prisma.file.aggregate({
    where: { userId: session.user.id },
    _sum: { size: true },
    _count: true,
  });

  const folderCount = await prisma.folder.count({
    where: { userId: session.user.id },
  });

  const typeStats = await prisma.file.groupBy({
    by: ["mimeType"],
    where: { userId: session.user.id },
    _sum: { size: true },
    _count: true,
    orderBy: {
      _sum: {
        size: "desc",
      },
    },
    take: 5,
  });

  const totalUsed = fileStats._sum.size || 0;
  const TOTAL_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB
  const usagePercent = Math.min((totalUsed / TOTAL_LIMIT) * 100, 100);

  // Helper to categorize mime types slightly better for display
  const categorizedStats = typeStats.map((stat) => {
    let label = stat.mimeType || "Unknown";
    if (label.startsWith("image/")) label = "Images";
    else if (label.startsWith("video/")) label = "Videos";
    else if (label.startsWith("audio/")) label = "Audio";
    else if (label.includes("pdf")) label = "PDF Documents";
    else if (label.includes("zip") || label.includes("compressed"))
      label = "Archives";
    return { ...stat, label };
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usage</h1>
        <p className="text-muted-foreground">
          Monitor your storage consumption and file statistics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDriveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalUsed)}</div>
            <p className="text-xs text-muted-foreground">
              of {formatBytes(TOTAL_LIMIT)} used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats._count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Folders</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{folderCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Limit</CardTitle>
          <CardDescription>
            You are currently using {usagePercent.toFixed(1)}% of your available
            storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={usagePercent} className="h-4" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by File Type</CardTitle>
          <CardDescription>Top 5 file types by storage usage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categorizedStats.map((stat, i) => (
              <div key={i} className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {stat.label}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({stat.mimeType})
                    </span>
                  </p>
                  <Progress
                    value={Math.min(
                      (Number(stat._sum.size) / totalUsed) * 100,
                      100
                    )}
                    className="h-2"
                  />
                </div>
                <div className="ml-4 font-medium text-sm">
                  {formatBytes(Number(stat._sum.size))}
                </div>
              </div>
            ))}
            {categorizedStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No usage data available.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
