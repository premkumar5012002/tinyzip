"use server";

import { auth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function globalSearch(query: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  console.log(
    `Global Search for query: "${query}" for user: ${session.user.id}`
  );

  if (!query || query.length < 2) {
    return { files: [], folders: [] };
  }

  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: {
        userId: session.user.id,
        name: { contains: query, mode: "insensitive" },
      },
      take: 5,
    }),
    prisma.file.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { originalName: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
  ]);

  return {
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
    })),
    files: files.map((f) => ({
      id: f.id,
      name: f.name,
      folderId: f.folderId,
      size: f.size,
      mimeType: f.mimeType,
    })),
  };
}
