import React from "react";
import { Progress } from "@/components/ui/progress";
import { FileItem } from "./types";
import { getFileIcon } from "./utils";
import { formatBytes } from "@/lib/format";

interface FileGridProps {
  files: FileItem[];
  selected: Set<string>;
  toggleOne: (id: string, e: React.SyntheticEvent) => void;
  openItem: (item: FileItem) => void;
}

export function FileGrid({
  files,
  selected,
  toggleOne,
  openItem,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {files.map((item) => {
        const isSelected = selected.has(item.id);
        const isImage = (item.mimeType || "").startsWith("image/");
        return (
          <div
            key={item.id}
            className={`group relative border border-muted-foreground/20 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${
              isSelected ? "ring-2 ring-primary border-primary" : ""
            }`}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) toggleOne(item.id, e);
              else openItem(item);
            }}
          >
            <div className="aspect-square bg-muted/30 flex items-center justify-center relative">
              {isImage && item.status === "done" && !item.isFolder ? (
                getFileIcon(item)
              ) : (
                <div className="scale-150 text-muted-foreground/50">
                  {getFileIcon(item)}
                </div>
              )}
              <div
                className="absolute top-2 left-2"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => toggleOne(item.id, e)}
                  className="size-4 accent-foreground"
                />
              </div>
            </div>
            <div className="p-3">
              <p className="font-medium truncate text-sm" title={item.name}>
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.isFolder ? "Folder" : formatBytes(item.size)}
              </p>
              {item.status === "uploading" && (
                <div className="mt-2">
                  <Progress value={item.progress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
