"use client";

import * as React from "react";
import { toast } from "sonner";
import { getUploadUrl, completeUpload } from "@/actions/files";

export type UploadStatus = "uploading" | "done" | "error" | "canceled";

export type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  folderId: string | null;
  xhr?: XMLHttpRequest;
  error?: string;
};

interface UploadProgressContextType {
  uploads: Map<string, UploadItem>;
  startUpload: (files: File[], folderId: string | null) => Promise<void>;
  cancelUpload: (id: string) => void;
  clearCompleted: () => void;
  minimized: boolean;
  setMinimized: (minimized: boolean) => void;
}

const UploadProgressContext =
  React.createContext<UploadProgressContextType | null>(null);

export function UploadProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [uploads, setUploads] = React.useState<Map<string, UploadItem>>(
    new Map()
  );
  const [minimized, setMinimized] = React.useState(false);

  const updateUpload = React.useCallback(
    (id: string, updates: Partial<UploadItem>) => {
      setUploads((prev) => {
        const newMap = new Map(prev);
        const item = newMap.get(id);
        if (item) {
          newMap.set(id, { ...item, ...updates });
        }
        return newMap;
      });
    },
    []
  );

  const startUpload = React.useCallback(
    async (files: File[], folderId: string | null) => {
      // Map to items with IDs
      const newItems = files.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
      }));

      // Add to state
      setUploads((prev) => {
        const newMap = new Map(prev);
        newItems.forEach(({ id, file }) => {
          newMap.set(id, {
            id,
            file,
            progress: 0,
            status: "uploading",
            folderId,
          });
        });
        return newMap;
      });

      // Expand popover when upload starts
      setMinimized(false);

      // Start uploads
      newItems.forEach(async ({ id, file }) => {
        try {
          const { url, key } = await getUploadUrl(
            file.name,
            file.type || "application/octet-stream",
            file.size
          );

          const xhr = new XMLHttpRequest();
          updateUpload(id, { xhr });

          xhr.open("PUT", url);
          if (file.type) {
            xhr.setRequestHeader("Content-Type", file.type);
          }

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              updateUpload(id, { progress: percentComplete });
            }
          };

          xhr.onload = async () => {
            if (xhr.status === 200) {
              try {
                await completeUpload(
                  key,
                  file.name,
                  file.size,
                  file.type || "application/octet-stream",
                  folderId
                );
                updateUpload(id, { status: "done", progress: 100 });
                // Refresh logic should happen here or via event
                // Ideally we broadcast an event or use a server action revalidate
                // For now, we rely on the component using the file browser to refresh/revalidate if it's watching
                // But wait, completeUpload typically calls revalidatePath.
              } catch (err) {
                console.error("Complete upload error", err);
                updateUpload(id, {
                  status: "error",
                  error: "Failed to finalize",
                });
                toast.error(`Failed to complete upload for ${file.name}`);
              }
            } else {
              updateUpload(id, { status: "error", error: "Upload failed" });
              toast.error(`Failed to upload ${file.name}`);
            }
          };

          xhr.onerror = () => {
            updateUpload(id, { status: "error", error: "Network error" });
            toast.error(`Failed to upload ${file.name}`);
          };

          xhr.onabort = () => {
            updateUpload(id, { status: "canceled" });
          };

          xhr.send(file);
        } catch (e) {
          console.error("Start upload error", e);
          updateUpload(id, {
            status: "error",
            error: "Could not start upload",
          });
          toast.error(`Failed to start upload for ${file.name}`);
        }
      });
    },
    [updateUpload]
  );

  const cancelUpload = React.useCallback(
    (id: string) => {
      setUploads((prev) => {
        const item = prev.get(id);
        if (item && item.xhr && item.status === "uploading") {
          item.xhr.abort();
        }
        return prev;
      });
      updateUpload(id, { status: "canceled" });
    },
    [updateUpload]
  );

  const clearCompleted = React.useCallback(() => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      for (const [id, item] of newMap.entries()) {
        if (item.status === "done" || item.status === "canceled") {
          newMap.delete(id);
        }
      }
      return newMap;
    });
  }, []);

  return (
    <UploadProgressContext.Provider
      value={{
        uploads,
        startUpload,
        cancelUpload,
        clearCompleted,
        minimized,
        setMinimized,
      }}
    >
      {children}
    </UploadProgressContext.Provider>
  );
}

export function useUploadProgress() {
  const context = React.useContext(UploadProgressContext);
  if (!context) {
    throw new Error(
      "useUploadProgress must be used within an UploadProgressProvider"
    );
  }
  return context;
}
