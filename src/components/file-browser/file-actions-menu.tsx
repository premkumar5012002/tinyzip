import {
  CopyIcon,
  DownloadIcon,
  MoveIcon,
  Trash2Icon,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileItem } from "./types";

interface FileActionsMenuProps {
  item: FileItem;
  onDownload: (item: FileItem) => void;
  onCopyLink: (item: FileItem) => void;
  onMove: (item: FileItem) => void;
  onCopy: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
}

export function FileActionsMenu({
  item,
  onDownload,
  onCopyLink,
  onMove,
  onCopy,
  onDelete,
}: FileActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!item.isFolder && (
          <DropdownMenuItem onClick={() => onDownload(item)}>
            <DownloadIcon className="mr-2 size-4" /> Download
          </DropdownMenuItem>
        )}
        {!item.isFolder && (
          <DropdownMenuItem onClick={() => onCopyLink(item)}>
            <CopyIcon className="mr-2 size-4" /> Copy Link
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onMove(item)}>
          <MoveIcon className="mr-2 size-4" /> Move to...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopy(item)}>
          <CopyIcon className="mr-2 size-4" /> Copy to...
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(item)}
        >
          <Trash2Icon className="mr-2 size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
