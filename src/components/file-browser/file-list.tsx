import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { FileItem } from "./types";
import { getFileIcon } from "./utils";
import { formatBytes } from "@/lib/format";
import { FileActionsMenu } from "./file-actions-menu";

interface FileListProps {
  files: FileItem[];
  selected: Set<string>;
  toggleOne: (id: string, e: React.SyntheticEvent) => void;
  toggleAll: () => void;
  allSelected: boolean;
  openItem: (item: FileItem) => void;
  onDownload: (item: FileItem) => void;
  onCopyLink: (item: FileItem) => void;
  onMove: (item: FileItem) => void;
  onCopy: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
}

export function FileList({
  files,
  selected,
  toggleOne,
  toggleAll,
  allSelected,
  openItem,
  onDownload,
  onCopyLink,
  onMove,
  onCopy,
  onDelete,
}: FileListProps) {
  return (
    <div className="rounded-md border border-muted-foreground/20">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-muted-foreground/20 hover:bg-transparent">
            <TableHead className="w-10 pl-4">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              File Name
            </TableHead>

            <TableHead className="text-muted-foreground font-medium">
              Size
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Upload Date
            </TableHead>
            <TableHead className="text-right text-muted-foreground font-medium"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <TableRow
                key={item.id}
                data-selected={isSelected}
                onDoubleClick={() => openItem(item)}
                className="cursor-pointer border-b border-muted-foreground/20 hover:bg-accent/50 data-[selected=true]:bg-accent"
              >
                <TableCell
                  className="pl-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() =>
                      toggleOne(item.id, {
                        stopPropagation: () => {},
                      } as unknown as React.SyntheticEvent)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-muted flex items-center justify-center shrink-0 text-primary">
                      {getFileIcon(item)}
                    </div>
                    <span className="font-medium truncate max-w-[150px] sm:max-w-xs text-foreground">
                      {item.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground text-sm">
                  {item.isFolder ? "-" : formatBytes(item.size)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.status === "uploading" ? (
                    <div className="w-[100px] ml-auto">
                      <Progress
                        value={item.progress}
                        className="h-1 bg-muted"
                      />
                    </div>
                  ) : (
                    <FileActionsMenu
                      item={item}
                      onDownload={onDownload}
                      onCopyLink={onCopyLink}
                      onMove={onMove}
                      onCopy={onCopy}
                      onDelete={onDelete}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
