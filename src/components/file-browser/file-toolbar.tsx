import { ArrowUp, GridIcon, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderPlusIcon, PlusIcon, UploadIcon } from "lucide-react";

interface FileToolbarProps {
  currentFolderId: string | null;
  goUp: () => void;
  sortBy: "name" | "type" | "size";
  setSortBy: (sort: "name" | "type" | "size") => void;
  view: "list" | "grid";
  setView: (view: "list" | "grid") => void;
  openFileDialog: () => void;
  setIsNewFolderOpen: (open: boolean) => void;
}

export function FileToolbar({
  currentFolderId,
  goUp,
  sortBy,
  setSortBy,
  view,
  setView,
  openFileDialog,
  setIsNewFolderOpen,
}: FileToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <Select
          onValueChange={(value) => setSortBy(value as typeof sortBy)}
          value={sortBy}
        >
          <SelectTrigger className="w-[100px]">
            {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="type">Type</SelectItem>
            <SelectItem value="size">Size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {view === "list" ? (
                <>
                  <ListIcon className="size-4" />
                  List
                </>
              ) : (
                <>
                  <GridIcon className="size-4" />
                  Grid
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setView("list")}>
              <ListIcon className="mr-2 size-4" /> List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setView("grid")}>
              <GridIcon className="mr-2 size-4" /> Grid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusIcon />
              <span className="hidden sm:inline">New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openFileDialog}>
              <UploadIcon className="mr-2 size-4" /> File Upload
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsNewFolderOpen(true)}>
              <FolderPlusIcon className="mr-2 size-4" /> New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
