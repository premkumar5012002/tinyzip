"use client";

import * as React from "react";
import { UploadCloudIcon } from "lucide-react";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useRouter } from "next/navigation";
import { useUploadProgress } from "@/context/upload-progress-context";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  deleteItems,
  getDownloadUrl,
  createFolder,
  moveItems,
  copyItems,
  FileItem as ServerFileItem,
} from "@/actions/files";

import { sanitizeFilename } from "@/lib/utils";

import { FileItem } from "@/components/file-browser/types";
import { getExt } from "@/components/file-browser/utils";
import { FileBreadcrumbs } from "@/components/file-browser/file-breadcrumbs";
import { FileToolbar } from "@/components/file-browser/file-toolbar";
import { FileList } from "@/components/file-browser/file-list";
import { FileGrid } from "@/components/file-browser/file-grid";
import { EmptyState } from "@/components/file-browser/empty-state";
import { SelectionBar } from "@/components/file-browser/selection-bar";
import { FolderSelectTree } from "@/components/file-browser/folder-select-tree";

interface FileBrowserProps {
  initialFiles: ServerFileItem[];
  externalQuery?: string;
  externalIsNewFolderOpen?: boolean;
  externalSetIsNewFolderOpen?: (open: boolean) => void;
  folderId?: string | null;
  isSearchResults?: boolean;
}

export interface FileBrowserRef {
  openFileDialog: () => void;
}

const FileBrowser = React.forwardRef<FileBrowserRef, FileBrowserProps>(
  (
    {
      initialFiles,
      externalQuery,
      externalIsNewFolderOpen,

      externalSetIsNewFolderOpen,
      folderId,
      isSearchResults,
    },
    ref
  ) => {
    // Tunables
    const maxSize = 20 * 1024 * 1024 * 1024; // 20GB
    const maxFiles = 100;

    const router = useRouter();

    // State
    const [allFiles, setAllFiles] = React.useState<FileItem[]>(
      initialFiles.map((f) => ({
        ...f,
        status: "done",
      }))
    );

    const [internalFolderId, setInternalFolderId] = React.useState<
      string | null
    >(null);

    const isControlled = folderId !== undefined;
    const currentFolderId = isControlled ? folderId : internalFolderId;

    const setCurrentFolderId = (id: string | null) => {
      if (isControlled) {
        if (id) {
          router.push(`/folder/${id}`);
        } else {
          router.push(`/`);
        }
      } else {
        setInternalFolderId(id);
      }
    };

    const [view, setView] = React.useState<"list" | "grid">("list");
    const [internalQuery, setInternalQuery] = React.useState("");
    const query = externalQuery !== undefined ? externalQuery : internalQuery;
    const setQuery = externalQuery !== undefined ? () => {} : setInternalQuery;
    const [sortBy, setSortBy] = React.useState<"name" | "type" | "size">(
      "name"
    );
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
    const [selected, setSelected] = React.useState<Set<string>>(new Set());

    // Dialogs
    const [internalIsNewFolderOpen, setInternalIsNewFolderOpen] =
      React.useState(false);
    const isNewFolderOpen =
      externalIsNewFolderOpen !== undefined
        ? externalIsNewFolderOpen
        : internalIsNewFolderOpen;
    const setIsNewFolderOpen =
      externalSetIsNewFolderOpen || setInternalIsNewFolderOpen;
    const [newFolderName, setNewFolderName] = React.useState("");
    const [isMoveOpen, setIsMoveOpen] = React.useState(false);
    const [moveTargetId, setMoveTargetId] = React.useState<string | null>(null);
    const [isCopyOpen, setIsCopyOpen] = React.useState(false);

    // Sync initialFiles to allFiles
    React.useEffect(() => {
      setAllFiles(
        initialFiles.map((f) => ({
          ...f,
          status: "done",
        }))
      );
    }, [initialFiles]);

    // Upload Context
    const { startUpload, uploads } = useUploadProgress();
    const routerRef = React.useRef(router);
    React.useEffect(() => {
      routerRef.current = router;
    }, [router]);

    // Watch for completed uploads to trigger refresh
    React.useEffect(() => {
      const hasCompletedInThisFolder = Array.from(uploads.values()).some(
        (u) =>
          u.folderId === currentFolderId &&
          u.status === "done" &&
          !allFiles.some(
            (f) =>
              f.name === sanitizeFilename(u.file.name) && f.size === u.file.size
          ) // Simple dedup check
      );

      if (hasCompletedInThisFolder) {
        // Debounce or just call? SWR/Next usually handles deduping refreshes well.
        routerRef.current.refresh();
      }
    }, [uploads, currentFolderId, allFiles]);

    // Active uploads in current folder (including recently done ones not yet in server list)
    const activeUploads = React.useMemo(() => {
      return Array.from(uploads.values())
        .filter((u) => {
          if (u.folderId !== currentFolderId) return false;
          if (u.status === "uploading") return true;
          if (u.status === "done") {
            // Keep showing 'done' files until they appear in initialFiles/allFiles
            const alreadyExists = allFiles.some(
              (f) =>
                f.name === sanitizeFilename(u.file.name) &&
                f.size === u.file.size
            );
            return !alreadyExists;
          }
          return false;
        })
        .map(
          (u) =>
            ({
              id: u.id,
              name: u.file.name,
              size: u.file.size,
              type: u.file.type || "",
              status: u.status === "uploading" ? "uploading" : "done",
              progress: u.progress,
              isFolder: false,
              parentId: currentFolderId,
              createdAt: new Date(),
              mimeType: u.file.type || null,
            } as FileItem)
        );
    }, [uploads, currentFolderId, allFiles]);

    // useFileUpload
    const [
      { isDragging },
      {
        handleDragLeave,
        handleDragOver,
        handleDrop,
        openFileDialog,
        getInputProps,
      },
    ] = useFileUpload({
      multiple: true,
      maxFiles,
      maxSize,
      onFilesAdded: async (addedFiles) => {
        const filesToUpload = addedFiles
          .map((af) => (af.file instanceof File ? af.file : null))
          .filter(Boolean) as File[];

        if (filesToUpload.length > 0) {
          await startUpload(filesToUpload, currentFolderId);
        }
      },
    });

    // Expose openFileDialog via ref
    React.useImperativeHandle(ref, () => ({
      openFileDialog,
    }));

    // Derived: Current Folder Path
    const breadcrumbs = React.useMemo(() => {
      const path = [];
      let curr = currentFolderId;
      while (curr) {
        const folder = allFiles.find((f) => f.id === curr);
        if (folder) {
          path.unshift({ id: folder.id, name: folder.name });
          curr = folder.parentId;
        } else {
          break;
        }
      }
      return path;
    }, [currentFolderId, allFiles]);

    // Old handleUpload removed

    const createNewFolder = async () => {
      if (!newFolderName.trim()) return;
      try {
        const tempId = "temp-" + Date.now();
        const newFolder: FileItem = {
          id: tempId,
          name: newFolderName,
          isFolder: true,
          size: 0,
          parentId: currentFolderId,
          status: "done",
          createdAt: new Date(),
          mimeType: null,
        };
        setAllFiles((prev) => [newFolder, ...prev]);
        setIsNewFolderOpen(false);
        setNewFolderName("");

        await createFolder(newFolderName, currentFolderId || undefined);

        toast.success("Folder created");
      } catch {
        toast.error("Failed to create folder");
      }
    };

    const handleMove = async () => {
      const ids = Array.from(selected);
      try {
        await moveItems(ids, moveTargetId || undefined);
        toast.success("Files moved");
        setIsMoveOpen(false);
        setSelected(new Set());
      } catch (e) {
        toast.error((e as Error).message);
      }
    };

    const handleCopy = async () => {
      const ids = Array.from(selected);
      try {
        await copyItems(ids, moveTargetId || undefined);
        toast.success("Files copied");
        setIsCopyOpen(false);
        setSelected(new Set());
      } catch (e) {
        toast.error((e as Error).message);
      }
    };

    // Filter Logic
    const displayFiles = React.useMemo(
      () => [...allFiles, ...activeUploads],
      [allFiles, activeUploads]
    );

    const filtered = React.useMemo(() => {
      let scope = displayFiles.filter((f) => f.parentId === currentFolderId);
      const q = query.trim().toLowerCase();

      if (q) {
        scope = allFiles;
      }

      const base = q
        ? scope.filter((f) => {
            const name = f.name.toLowerCase();
            const type = (f.mimeType || "").toLowerCase();
            const ext = getExt(name);
            return name.includes(q) || type.includes(q) || ext.includes(q);
          })
        : scope;

      const sorter = (a: FileItem, b: FileItem) => {
        let cmp = 0;
        if (a.isFolder !== b.isFolder) {
          return a.isFolder ? -1 : 1;
        }
        if (sortBy === "name") {
          cmp = a.name.localeCompare(b.name);
        } else if (sortBy === "type") {
          cmp = (a.mimeType || "").localeCompare(b.mimeType || "");
        } else {
          cmp = a.size - b.size;
        }
        return sortDir === "asc" ? cmp : -cmp;
      };

      return [...base].sort(sorter);
    }, [allFiles, query, sortBy, sortDir, currentFolderId]);

    const toggleOne = (id: string, e?: React.SyntheticEvent) => {
      if (e) e.stopPropagation();
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    const toggleAll = () =>
      setSelected((prev) => {
        if (filtered.length === 0) return prev;
        const everySelected = filtered.every((f) => prev.has(f.id));
        if (everySelected) return new Set();
        return new Set(filtered.map((f) => f.id));
      });

    const removeSelected = async () => {
      const text = "Are you sure you want to delete selected items?";
      if (!confirm(text)) return;

      const ids = Array.from(selected);
      const itemsToDelete = allFiles.filter((f) => selected.has(f.id));
      setAllFiles((prev) => prev.filter((f) => !selected.has(f.id)));
      setSelected(new Set());

      try {
        await deleteItems(ids);
        toast.success("Items deleted");
      } catch {
        toast.error("Failed to delete items");
        setAllFiles((prev) => [...prev, ...itemsToDelete]);
      }
    };

    const downloadOne = async (item: FileItem) => {
      if (item.status === "uploading") return;
      if (item.isFolder) return;

      try {
        const url = await getDownloadUrl(item.id);
        window.open(url, "_blank");
      } catch {
        toast.error("Could not download file");
      }
    };

    const copyLink = async (item: FileItem) => {
      if (item.isFolder) return;
      try {
        const url = await getDownloadUrl(item.id);
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      } catch {
        toast.error("Failed to copy link");
      }
    };

    const openItem = (item: FileItem) => {
      if (item.isFolder) {
        setCurrentFolderId(item.id);
        setQuery("");
        setSelected(new Set());
      } else {
        downloadOne(item);
      }
    };

    const goUp = () => {
      if (!currentFolderId) return;
      const curr = allFiles.find((f) => f.id === currentFolderId);
      setCurrentFolderId(curr?.parentId || null);
      setSelected(new Set());
    };

    const effectiveView = isSearchResults ? "list" : view;

    return (
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        {!isSearchResults && (
          <>
            <div className="flex flex-col gap-4">
              <FileBreadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <FileToolbar
              goUp={goUp}
              sortBy={sortBy}
              setSortBy={setSortBy}
              view={view}
              setView={setView}
              openFileDialog={openFileDialog}
              setIsNewFolderOpen={setIsNewFolderOpen}
            />
          </>
        )}

        {isDragging && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-8"
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="border-4 border-dashed border-primary rounded-3xl w-full h-full flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-200">
              <UploadCloudIcon className="size-24 text-primary" />
              <p className="text-2xl font-bold">
                Drop files to upload to{" "}
                {currentFolderId ? "this folder" : "Home"}
              </p>
            </div>
          </div>
        )}
        <input {...getInputProps()} className="sr-only" />

        {filtered.length === 0 ? (
          <EmptyState
            onUpload={openFileDialog}
            onCreateFolder={() => setIsNewFolderOpen(true)}
            title={
              query || isSearchResults ? "No files or folders found" : undefined
            }
            description={
              query || isSearchResults
                ? "Your search term did not match any files or folders."
                : undefined
            }
          />
        ) : effectiveView === "list" ? (
          <FileList
            files={filtered}
            selected={selected}
            toggleOne={toggleOne}
            toggleAll={toggleAll}
            allSelected={
              filtered.length > 0 && filtered.every((f) => selected.has(f.id))
            }
            openItem={openItem}
            onDownload={downloadOne}
            onCopyLink={copyLink}
            onMove={(item) => {
              setSelected(new Set([item.id]));
              setIsMoveOpen(true);
            }}
            onCopy={(item) => {
              setSelected(new Set([item.id]));
              setIsCopyOpen(true);
            }}
            onDelete={(item) => {
              setSelected(new Set([item.id]));
              removeSelected();
            }}
          />
        ) : (
          <FileGrid
            files={filtered}
            selected={selected}
            toggleOne={toggleOne}
            openItem={openItem}
          />
        )}

        <SelectionBar
          selectedCount={selected.size}
          onMove={() => setIsMoveOpen(true)}
          onCopy={() => setIsCopyOpen(true)}
          onDelete={removeSelected}
          onCancel={() => setSelected(new Set())}
        />

        <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your files.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={createNewFolder}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move {selected.size} Item(s) to...</DialogTitle>
            </DialogHeader>
            <FolderSelectTree
              files={allFiles}
              moveTargetId={moveTargetId}
              onSelect={setMoveTargetId}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMoveOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMove}>Move</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCopyOpen} onOpenChange={setIsCopyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy {selected.size} Item(s) to...</DialogTitle>
            </DialogHeader>
            <FolderSelectTree
              files={allFiles}
              moveTargetId={moveTargetId}
              onSelect={setMoveTargetId}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCopyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCopy}>Copy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

FileBrowser.displayName = "FileBrowser";

export default FileBrowser;
