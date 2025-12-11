import {
  FileIcon,
  FolderIcon,
  FileTextIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  VideoIcon,
  HeadphonesIcon,
  ImageIcon,
} from "lucide-react";
import { FileItem } from "./types";

export const getExt = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : "";
};

export const niceSubtype = (mime?: string | null, isFolder?: boolean) => {
  if (isFolder) return "FOLDER";
  if (!mime) return "UNKNOWN";
  const parts = mime.split("/");
  return (parts[1] || parts[0] || "unknown").toUpperCase();
};

export const getFileIcon = (file: FileItem) => {
  if (file.isFolder) {
    return (
      <FolderIcon
        className="size-4 opacity-60 fill-sky-200 text-sky-500"
        aria-hidden="true"
      />
    );
  }

  const name = file.name;
  const type = file.mimeType || "";
  const ext = getExt(name);

  if (
    type.includes("pdf") ||
    ext === "pdf" ||
    type.includes("word") ||
    ext === "doc" ||
    ext === "docx" ||
    type.includes("text") ||
    ext === "txt" ||
    ext === "md"
  ) {
    return <FileTextIcon className="size-4 opacity-60" aria-hidden="true" />;
  }

  if (
    type.includes("zip") ||
    type.includes("archive") ||
    ext === "zip" ||
    ext === "rar" ||
    ext === "7z" ||
    ext === "tar"
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" aria-hidden="true" />;
  }

  if (
    type.includes("excel") ||
    ext === "xls" ||
    ext === "xlsx" ||
    ext === "csv"
  ) {
    return (
      <FileSpreadsheetIcon className="size-4 opacity-60" aria-hidden="true" />
    );
  }

  if (
    type.startsWith("video/") ||
    ["mp4", "mov", "webm", "mkv"].includes(ext)
  ) {
    return <VideoIcon className="size-4 opacity-60" aria-hidden="true" />;
  }

  if (
    type.startsWith("audio/") ||
    ["mp3", "wav", "flac", "m4a"].includes(ext)
  ) {
    return <HeadphonesIcon className="size-4 opacity-60" aria-hidden="true" />;
  }

  if (
    type.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
  ) {
    return <ImageIcon className="size-4 opacity-60" aria-hidden="true" />;
  }
  return <FileIcon className="size-4 opacity-60" aria-hidden="true" />;
};
