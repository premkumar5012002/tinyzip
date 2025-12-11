import { MoveIcon, CopyIcon, Trash2Icon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectionBarProps {
  selectedCount: number;
  onMove: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function SelectionBar({
  selectedCount,
  onMove,
  onCopy,
  onDelete,
  onCancel,
}: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background px-4 py-3 rounded-full shadow-lg flex items-center gap-4 animate-in slide-in-from-bottom-4">
      <span className="font-medium pl-2">{selectedCount} selected</span>
      <div className="h-4 w-px bg-background/30" />
      <Button
        size="sm"
        variant="ghost"
        className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground h-8"
        onClick={onMove}
      >
        <MoveIcon className="size-4 mr-2" /> Move
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground h-8"
        onClick={onCopy}
      >
        <CopyIcon className="size-4 mr-2" /> Copy
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground h-8"
        onClick={onDelete}
      >
        <Trash2Icon className="size-4 mr-2" />
        Delete
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground h-8"
        onClick={onCancel}
      >
        <X className="size-4 mr-2" /> Cancel
      </Button>
    </div>
  );
}
