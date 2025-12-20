import { MoveIcon, CopyIcon, Trash2Icon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-card px-4 py-2 rounded-md shadow-2xl border border-muted-foreground/20 flex items-center gap-4 animate-in slide-in-from-bottom-4 backdrop-blur-md">
      <span className="text-sm font-semibold pl-2 whitespace-nowrap">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-muted-foreground/20" />

      <ButtonGroup className="overflow-hidden">
        <Button variant="outline" size="sm" onClick={onMove}>
          <MoveIcon className="size-4" />
          <span className="text-xs font-medium">Move</span>
        </Button>

        <Button variant="outline" size="sm" onClick={onCopy}>
          <CopyIcon className="size-4" />
          <span className="text-xs font-medium">Copy</span>
        </Button>

        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2Icon className="size-4" />
          <span className="text-xs font-medium">Delete</span>
        </Button>
      </ButtonGroup>

      <div className="h-4 w-px bg-muted-foreground/20" />

      <Button variant="ghost" size="sm" onClick={onCancel}>
        <X className="size-4" />
        <span className="text-xs font-medium">Cancel</span>
      </Button>
    </div>
  );
}
