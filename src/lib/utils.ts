import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "");
}
