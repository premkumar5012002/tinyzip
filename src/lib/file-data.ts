import { auth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export type UnifiedFileItem = {
  id: string;
  name: string;
  size: number;
  mimeType: string | null;
  isFolder: boolean;
  parentId: string | null;
  createdAt: Date;
  storageUrl?: string | null;
};

export async function getAllFilesAndFolders() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  // Fetch both files and folders
  const folders = await prisma.folder.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  const files = await prisma.file.findMany({
    where: { user: { id: session.user.id } },
    orderBy: { createdAt: "desc" },
  });

  // Map to unified FileItem
  const allItems: UnifiedFileItem[] = [
    ...folders.map((f) => ({
      id: f.id,
      name: f.name,
      size: 0,
      mimeType: null,
      isFolder: true,
      parentId: f.parentId,
      createdAt: f.createdAt,
    })),
    ...files.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      mimeType: f.mimeType,
      isFolder: false,
      parentId: f.folderId, // Map folderId to parentId for UI
      createdAt: f.createdAt,
      storageUrl: f.storageUrl,
    })),
  ];

  return allItems;
}
