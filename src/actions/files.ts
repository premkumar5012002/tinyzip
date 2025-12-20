"use server";

import { auth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import {
  GetObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sanitizeFilename } from "@/lib/utils";

export type FileItem = {
  id: string;
  name: string;
  size: number;
  mimeType: string | null;
  isFolder: boolean;
  parentId: string | null;
  createdAt: Date;
  storageUrl?: string | null;
};

export async function getFiles(folderId: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const folders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
      userId: session.user.id,
    },
    orderBy: { name: "asc" },
  });

  const files = await prisma.file.findMany({
    where: {
      folderId: folderId,
      userId: session.user.id,
    },
    orderBy: { name: "asc" },
  });

  // Map to unified structure
  const mappedFolders: FileItem[] = folders.map((f) => ({
    id: f.id,
    name: f.name,
    size: 0,
    mimeType: null,
    isFolder: true,
    parentId: f.parentId,
    createdAt: f.createdAt,
  }));

  const mappedFiles: FileItem[] = files.map((f) => ({
    id: f.id,
    name: f.name,
    size: f.size,
    mimeType: f.mimeType,
    isFolder: false,
    parentId: f.folderId,
    createdAt: f.createdAt,
    storageUrl: f.storageUrl,
  }));

  return [...mappedFolders, ...mappedFiles];
}

export async function deleteItems(ids: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // 1. Identify what is what
  // We can try to delete from both or query first.
  // Querying is safer to know what S3 objects to delete.

  // Fetch Files
  const files = await prisma.file.findMany({
    where: { id: { in: ids }, userId: session.user.id },
  });

  // Fetch Folders
  const folders = await prisma.folder.findMany({
    where: { id: { in: ids }, userId: session.user.id },
  });

  // Collect S3 keys from files
  const filesToDelete = [...files];

  // For folders, we need recursive file finding if we want to clean S3.
  // For MVP, letting S3 be dirty for deleted folders is acceptable vs complex recursion here?
  // Let's try simple recursion for 1 level deep? No, folders can be deep.
  // Ideally, if we delete a folder, we should find ALL files recursively under it.
  // Prisma Cascade deletes the records.

  // TODO: Recursive S3 cleanup. For now, only top-level selected files are cleaned from S3.

  if (filesToDelete.length > 0) {
    const objectsList = filesToDelete
      .map((file) => {
        const parts = file.storageUrl.split(process.env.S3_BUCKET!);
        let key = parts[1];
        if (key && key.startsWith("/")) key = key.substring(1);
        return { Key: key };
      })
      .filter((o) => o.Key);

    if (objectsList.length > 0) {
      try {
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: process.env.S3_BUCKET!,
            Delete: { Objects: objectsList },
          })
        );
      } catch (e) {
        console.error("Failed to delete S3 objects", e);
      }
    }
  }

  // Delete DB records
  if (files.length > 0) {
    await prisma.file.deleteMany({
      where: { id: { in: files.map((f) => f.id) } },
    });
  }

  if (folders.length > 0) {
    await prisma.folder.deleteMany({
      where: { id: { in: folders.map((f) => f.id) } },
    });
  }

  revalidatePath("/");
}

export async function createFolder(name: string, parentId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  await prisma.folder.create({
    data: {
      name,
      parentId: parentId || null,
      userId: session.user.id,
    },
  });

  revalidatePath("/");
}

// Separate move for files and folders? Or unified?
// IDs are unique CUIDs, so collisions unlikely.
export async function moveItems(ids: string[], targetParentId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  if (targetParentId && ids.includes(targetParentId)) {
    throw new Error("Cannot move a folder into itself");
  }

  const target = targetParentId || null;

  await prisma.file.updateMany({
    where: { id: { in: ids }, userId: session.user.id },
    data: { folderId: target },
  });

  await prisma.folder.updateMany({
    where: { id: { in: ids }, userId: session.user.id },
    data: { parentId: target },
  });

  revalidatePath("/");
}

// Helper for recursive copy
async function copyFolderRecursive(
  originalId: string,
  targetParentId: string | null,
  userId: string
) {
  const original = await prisma.folder.findUnique({
    where: { id: originalId },
    include: { children: true, files: true },
  });

  if (!original || original.userId !== userId) return;

  const newFolder = await prisma.folder.create({
    data: {
      name: original.name + " (Copy)",
      parentId: targetParentId,
      userId: userId,
    },
  });

  // Copy files
  for (const file of original.files) {
    await prisma.file.create({
      data: {
        name: file.name, // + Copy?
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        storageUrl: file.storageUrl,
        folderId: newFolder.id,
        userId: userId,
      },
    });
  }

  // Copy children
  for (const child of original.children) {
    await copyFolderRecursive(child.id, newFolder.id, userId);
  }
}

export async function copyItems(ids: string[], targetParentId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const target = targetParentId || null;

  // 1. Files
  const files = await prisma.file.findMany({
    where: { id: { in: ids }, userId: session.user.id },
  });
  for (const file of files) {
    await prisma.file.create({
      data: {
        name: file.name + " (Copy)",
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        storageUrl: file.storageUrl,
        folderId: target,
        userId: session.user.id,
      },
    });
  }

  // 2. Folders
  const folders = await prisma.folder.findMany({
    where: { id: { in: ids }, userId: session.user.id },
  });
  for (const folder of folders) {
    await copyFolderRecursive(folder.id, target, session.user.id);
  }

  revalidatePath("/");
}

export async function getDownloadUrl(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const file = await prisma.file.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!file || !file.storageUrl) {
    throw new Error("File not found");
  }

  const parts = file.storageUrl.split(process.env.S3_BUCKET!);
  let key = parts[1];
  if (key && key.startsWith("/")) key = key.substring(1);

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${
      file.originalName || file.name
    }"`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getUploadUrl(
  filename: string,
  contentType: string,
  size: number
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // Check storage limit (5GB)
  const LIMIT = 5 * 1024 * 1024 * 1024;

  const currentUsage = await prisma.file.aggregate({
    where: { userId: session.user.id },
    _sum: { size: true },
  });

  const totalUsed = currentUsage._sum.size || 0;

  if (totalUsed + size > LIMIT) {
    throw new Error("Storage limit exceeded (5GB)");
  }

  const timestamp = Date.now();
  const sanitizedName = filename
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "");
  const key = `${session.user.id}/${timestamp}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { url, key };
}

export async function completeUpload(
  key: string,
  filename: string,
  size: number,
  type: string,
  folderId?: string | null
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // Verify file exists in S3
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      })
    );
  } catch {
    throw new Error("File upload failed verification");
  }

  const sanitizedName = sanitizeFilename(filename);

  const url = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;

  const file = await prisma.file.create({
    data: {
      name: sanitizedName,
      originalName: filename,
      size: size,
      mimeType: type,
      storageUrl: url,
      folderId: folderId || null,
      userId: session.user.id,
    },
  });

  revalidatePath("/");
  return file;
}

export async function getStorageUsage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const usageByType = await prisma.file.groupBy({
    by: ["mimeType"],
    _sum: { size: true },
    _count: { id: true },
    where: { userId: session.user.id },
  });

  const image = { size: 0, count: 0 };
  const video = { size: 0, count: 0 };
  const document = { size: 0, count: 0 };
  const other = { size: 0, count: 0 };
  let totalUsed = 0;

  usageByType.forEach((group) => {
    const size = group._sum.size || 0;
    const count = group._count.id || 0;
    const type = group.mimeType || "";
    totalUsed += size;

    if (type.startsWith("image/")) {
      image.size += size;
      image.count += count;
    } else if (type.startsWith("video/")) {
      video.size += size;
      video.count += count;
    } else if (
      type.includes("pdf") ||
      type.includes("text") ||
      type.includes("document") ||
      type.includes("msword") ||
      type.includes("sheet") ||
      type.includes("presentation")
    ) {
      document.size += size;
      document.count += count;
    } else {
      other.size += size;
      other.count += count;
    }
  });

  return {
    used: totalUsed,
    total: 800 * 1024 * 1024 * 1024, // 800 GB Limit (Mocked for UI match)
    image,
    video,
    document,
    other,
  };
}

export async function searchFiles(query: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const folders = await prisma.folder.findMany({
    where: {
      userId: session.user.id,
      name: { contains: query, mode: "insensitive" },
    },
    orderBy: { name: "asc" },
  });

  const files = await prisma.file.findMany({
    where: {
      userId: session.user.id,
      name: { contains: query, mode: "insensitive" },
    },
    orderBy: { name: "asc" },
  });

  // Map to unified structure
  const mappedFolders: FileItem[] = folders.map((f) => ({
    id: f.id,
    name: f.name,
    size: 0,
    mimeType: null,
    isFolder: true,
    parentId: f.parentId,
    createdAt: f.createdAt,
  }));

  const mappedFiles: FileItem[] = files.map((f) => ({
    id: f.id,
    name: f.name,
    size: f.size,
    mimeType: f.mimeType,
    isFolder: false,
    parentId: f.folderId,
    createdAt: f.createdAt,
    storageUrl: f.storageUrl,
  }));

  return [...mappedFolders, ...mappedFiles];
}
