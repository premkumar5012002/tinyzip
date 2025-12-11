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
import { FileItem } from "./types";
import { getFileIcon, niceSubtype } from "./utils";
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="size-4 accent-foreground"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                className="cursor-pointer"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => toggleOne(item.id, e)}
                    className="size-4 accent-foreground"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-muted/50 flex items-center justify-center shrink-0">
                      {getFileIcon(item)}
                    </div>
                    <span className="font-medium truncate max-w-[200px] sm:max-w-md">
                      {item.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs uppercase">
                  {niceSubtype(item.mimeType, item.isFolder)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.isFolder ? "-" : formatBytes(item.size)}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.status === "uploading" ? (
                    <div className="w-[100px] ml-auto">
                      <Progress value={item.progress} className="h-2" />
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
