"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileIcon, FolderIcon, SearchIcon, Loader2 } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { globalSearch } from "@/actions/search";
import { useDebounce } from "use-debounce";
import { formatBytes } from "@/lib/format";
import { getFileIcon } from "./file-browser/utils";

export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    folders: { id: string; name: string; parentId: string | null }[];
    files: {
      id: string;
      name: string;
      folderId: string | null;
      size: number;
      mimeType: string | null;
    }[];
  }>({ folders: [], files: [] });

  const [debouncedQuery] = useDebounce(query, 300);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if ((debouncedQuery?.length || 0) < 2) {
      setResults({ folders: [], files: [] });
      return;
    }

    console.log("Searching for:", debouncedQuery);
    const search = async () => {
      setLoading(true);
      try {
        const data = await globalSearch(debouncedQuery as string);
        console.log("Search results:", data);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const onSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border border-muted-foreground/20 rounded-lg w-full max-w-md hover:bg-muted transition-colors group"
      >
        <SearchIcon className="size-4 group-hover:text-primary transition-colors" />
        <span>Search files and folders...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">?</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Type to search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
          {!loading &&
            query.length > 0 &&
            results.folders.length === 0 &&
            results.files.length === 0 && (
              <CommandEmpty>No results found for "{query}".</CommandEmpty>
            )}

          {results.folders.length > 0 && (
            <CommandGroup heading="Folders">
              {results.folders.map((folder) => (
                <CommandItem
                  key={folder.id}
                  onSelect={() => onSelect(`/folder/${folder.id}`)}
                  className="flex items-center gap-3 cursor-pointer py-3"
                >
                  <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <FolderIcon className="size-4 text-primary fill-primary/20" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{folder.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Folder
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.files.length > 0 && (
            <CommandGroup heading="Files">
              {results.files.map((file) => (
                <CommandItem
                  key={file.id}
                  onSelect={() =>
                    onSelect(file.folderId ? `/folder/${file.folderId}` : "/")
                  }
                  className="flex items-center justify-between cursor-pointer py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center text-primary">
                      {getFileIcon(file as any)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[250px]">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {file.mimeType?.split("/")[1] || "File"} •{" "}
                        {formatBytes(file.size)}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        <div className="flex items-center justify-between border-t border-muted-foreground/20 px-4 py-2 bg-muted/20">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1">?</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1">Enter</kbd> Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1">Esc</kbd> Close
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
            TinyZip Search
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
