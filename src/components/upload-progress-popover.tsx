"use client";

import * as React from "react";
import {
  useUploadProgress,
  UploadItem,
} from "@/context/upload-progress-context";
import {
  X,
  FileIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export function UploadProgressPopover() {
  const { uploads, minimized, setMinimized, cancelUpload, clearCompleted } =
    useUploadProgress();

  const [hasActiveUploads, setHasActiveUploads] = React.useState(false);

  const uploadsList = Array.from(uploads.values()).reverse();
  const totalUploads = uploadsList.length;

  const activeUploads = uploadsList.filter(
    (u) => u.status === "uploading"
  ).length;

  const progressTotal = React.useMemo(() => {
    if (uploadsList.length === 0) return 0;
    const totalProgress = uploadsList.reduce(
      (acc, curr) => acc + curr.progress,
      0
    );
    return totalProgress / uploadsList.length;
  }, [uploadsList]);

  React.useEffect(() => {
    if (uploads.size > 0 && !hasActiveUploads) {
      setHasActiveUploads(true);
    } else if (uploads.size === 0 && hasActiveUploads) {
      setHasActiveUploads(false);
    }
  }, [uploads.size, hasActiveUploads]);

  if (totalUploads === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col gap-2 bg-background border border-muted-foreground/20 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out",
          minimized ? "w-72" : "w-80 md:w-96"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-muted border-b border-muted-foreground/20">
          <div className="flex items-center gap-2">
            {activeUploads > 0 ? (
              <div className="relative">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm font-medium">
              {activeUploads > 0
                ? `Uploading ${activeUploads} file${
                    activeUploads > 1 ? "s" : ""
                  }...`
                : "Uploads completed"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setMinimized(!minimized)}
            >
              {minimized ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearCompleted}
              disabled={activeUploads > 0}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar (Global) - Visible when minimized or active */}
        {(minimized || activeUploads > 0) && (
          <div className="px-4 py-2">
            <Progress value={progressTotal} className="h-1.5" />
          </div>
        )}

        {/* Content - Hidden when minimized */}
        {!minimized && (
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col gap-2 p-4 pt-2">
              {uploadsList.map((upload) => (
                <UploadItemRow
                  key={upload.id}
                  upload={upload}
                  onCancel={() => cancelUpload(upload.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function UploadItemRow({
  upload,
  onCancel,
}: {
  upload: UploadItem;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors group">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <FileIcon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p
            className="text-xs font-medium truncate max-w-[150px]"
            title={upload.file.name}
          >
            {upload.file.name}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {upload.status === "error"
              ? "Failed"
              : upload.status === "canceled"
              ? "Canceled"
              : upload.status === "done"
              ? formatBytes(upload.file.size)
              : `${Math.round(upload.progress)}%`}
          </span>
        </div>
        <Progress
          value={upload.progress}
          className={cn(
            "h-1",
            upload.status === "error" &&
              "bg-destructive/20 [&>div]:bg-destructive",
            upload.status === "canceled" &&
              "bg-muted [&>div]:bg-muted-foreground"
          )}
        />
      </div>
      <div className="flex-shrink-0 w-8 flex items-center justify-end">
        {upload.status === "uploading" ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCancel}
          >
            <X className="w-3 h-3" />
          </Button>
        ) : upload.status === "done" ? (
          <CheckCircle2 className="w-4 h-4 text-primary" />
        ) : upload.status === "error" ? (
          <AlertCircle className="w-4 h-4 text-destructive" />
        ) : (
          <X className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
