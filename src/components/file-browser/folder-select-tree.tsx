import { GridIcon, FolderIcon } from "lucide-react";
import { FileItem } from "./types";

interface FolderSelectTreeProps {
  files: FileItem[];
  moveTargetId: string | null;
  onSelect: (id: string | null) => void;
}

export function FolderSelectTree({
  files,
  moveTargetId,
  onSelect,
}: FolderSelectTreeProps) {
  const folders = files.filter((f) => f.isFolder);

  return (
    <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
      <div
        className={`p-2 hover:bg-muted cursor-pointer rounded flex items-center gap-2 ${
          moveTargetId === null ? "bg-muted" : ""
        }`}
        onClick={() => onSelect(null)}
      >
        <GridIcon className="size-4" /> Root
      </div>
      {folders.map((f) => (
        <div
          key={f.id}
          className={`p-2 hover:bg-muted cursor-pointer rounded flex items-center gap-2 pl-6 ${
            moveTargetId === f.id ? "bg-muted" : ""
          }`}
          onClick={() => onSelect(f.id)}
        >
          <FolderIcon className="size-4" /> {f.name}
        </div>
      ))}
    </div>
  );
}
