"use server";

import { auth } from "@/lib/auth/server";
import { s3Client } from "@/lib/s3";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectIdentifier,
} from "@aws-sdk/client-s3";

export async function deleteAccount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const userId = session.user.id;
    const bucket = process.env.S3_BUCKET!;

    // 1. Delete all files from S3 recursively under the user's directory
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${userId}/`,
        ContinuationToken: continuationToken,
      });

      const response: ListObjectsV2CommandOutput = await s3Client.send(
        listCommand
      );

      if (response.Contents && response.Contents.length > 0) {
        const objectsToDelete: ObjectIdentifier[] = response.Contents.map(
          (obj) => ({
            Key: obj.Key!,
          })
        );

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objectsToDelete,
          },
        });

        await s3Client.send(deleteCommand);
      }

      isTruncated = response.IsTruncated || false;
      continuationToken = response.NextContinuationToken;
    }

    // 2. Delete user (cascades to DB records)
    await auth.api.deleteUser({
      headers: await headers(),
      body: {
        callbackURL: "/login",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { error: "Failed to delete account" };
  }
}
