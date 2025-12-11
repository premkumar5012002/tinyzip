"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { getStorageUsage } from "@/actions/files";
import { CloudIcon } from "lucide-react";

export function UsageBar() {
  const [usage, setUsage] = React.useState({ used: 0, total: 1 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getStorageUsage().then((data) => {
      setUsage(data);
      setLoading(false);
    });
  }, []);

  const percentage = Math.min((usage.used / usage.total) * 100, 100);

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(1) + " GB";
  };

  if (loading) return null;

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudIcon className="size-4" />
        <span>Storage</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="text-xs text-muted-foreground">
        {formatSize(usage.used)} of {formatSize(usage.total)} used
      </div>
    </div>
  );
}
