import { FileItem as ServerFileItem } from "@/actions/files";

export type FileItem = ServerFileItem & {
  status?: "uploading" | "error" | "done";
  progress?: number;
  fileObject?: File;
  preview?: string;
};
