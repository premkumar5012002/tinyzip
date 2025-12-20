"use client";

import * as React from "react";
import { getStorageUsage } from "@/actions/files";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ImageIcon, FileText, Video, MoreHorizontal, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function StorageOverview() {
  const [stats, setStats] = React.useState<{
    used: number;
    total: number;
    image: { size: number; count: number };
    video: { size: number; count: number };
    document: { size: number; count: number };
    other: { size: number; count: number };
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getStorageUsage().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <StorageOverviewSkeleton />;
  }

  if (!stats) return null;

  const getRelativePercent = (val: number) =>
    stats.used > 0 ? (val / stats.used) * 100 : 0;

  const categories = [
    {
      label: "Image Files",
      color: "bg-chart-1",
      icon: ImageIcon,
      size: stats.image.size,
      items: `${stats.image.count} items`,
      barColor: "bg-chart-1",
    },
    {
      label: "Document Files",
      color: "bg-chart-2",
      icon: FileText,
      size: stats.document.size,
      items: `${stats.document.count} items`,
      barColor: "bg-chart-2",
    },
    {
      label: "Video Files",
      color: "bg-chart-3",
      icon: Video,
      size: stats.video.size,
      items: `${stats.video.count} items`,
      barColor: "bg-chart-3",
    },
    {
      label: "Others Files",
      color: "bg-chart-4",
      icon: MoreHorizontal,
      size: stats.other.size,
      items: `${stats.other.count} items`,
      barColor: "bg-chart-4",
    },
  ];

  return (
    <div className="space-y-8 mb-8">
      {/* Top Header stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Data Storage <Info className="size-4 text-muted-foreground" />
          </h2>
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">
              {formatBytes(stats.used)}
            </span>{" "}
            out of {formatBytes(stats.total)} used
          </div>
        </div>

        {/* Multi-colored Progress Bar */}
        <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
          <div
            style={{ width: `${getRelativePercent(stats.image.size)}%` }}
            className="h-full bg-chart-1"
          />
          <div
            style={{ width: `${getRelativePercent(stats.document.size)}%` }}
            className="h-full bg-chart-2"
          />
          <div
            style={{ width: `${getRelativePercent(stats.video.size)}%` }}
            className="h-full bg-chart-3"
          />
          <div
            style={{ width: `${getRelativePercent(stats.other.size)}%` }}
            className="h-full bg-chart-4"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-chart-1" /> Image{" "}
              <span className="ml-1 opacity-70">
                {Math.round(getRelativePercent(stats.image.size))}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-chart-2" /> Document{" "}
              <span className="ml-1 opacity-70">
                {Math.round(getRelativePercent(stats.document.size))}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-chart-3" /> Video{" "}
              <span className="ml-1 opacity-70">
                {Math.round(getRelativePercent(stats.video.size))}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-chart-4" /> Others{" "}
              <span className="ml-1 opacity-70">
                {Math.round(getRelativePercent(stats.other.size))}%
              </span>
            </div>
          </div>
          <span>{formatBytes(stats.total - stats.used)} remaining</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="p-4 rounded-xl bg-card border shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-2 rounded-lg", cat.color, "bg-opacity-10")}>
                <cat.icon
                  className={cn("size-5", cat.color.replace("bg-", "text-"))}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-2 -mt-2"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </div>

            <div>
              <div className="font-semibold">{cat.label}</div>
              <div className="text-xs text-muted-foreground">{cat.items}</div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatBytes(cat.size)} used</span>
              </div>
              {/* Visual bar just for this category */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${cat.barColor}`}
                  style={{ width: `${getRelativePercent(cat.size)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Overview Storage <Info className="size-4 text-muted-foreground" />
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Last Modified
          </Button>
          <Button variant="outline" size="sm">
            Dec 12, 2024
          </Button>
        </div>
      </div>
    </div>
  );
}

function StorageOverviewSkeleton() {
  return (
    <div className="space-y-6 mb-8">
      <Skeleton className="h-8 w-full" />
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}
