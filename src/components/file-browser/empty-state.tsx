import { FileIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyStateProps {
  onUpload: () => void;
  onCreateFolder: () => void;
  title?: string;
  description?: string;
}

export function EmptyState({
  onUpload,
  onCreateFolder,
  title,
  description,
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileIcon />
        </EmptyMedia>
        <EmptyTitle>{title || "No Files or Folders Yet"}</EmptyTitle>
        <EmptyDescription>
          {description ||
            "You haven't created any files or folders yet. Get started by creating your first file or folder."}
        </EmptyDescription>
      </EmptyHeader>
      {!title && !description && (
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={onUpload}>Upload Files</Button>
            <Button variant="outline" onClick={onCreateFolder}>
              Create Folder
            </Button>
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
}
