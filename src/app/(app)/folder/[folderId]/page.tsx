import { auth } from "@/lib/auth/server";
import { getAllFilesAndFolders } from "@/lib/file-data";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FileBrowser from "../../file-browser";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const allItems = (await getAllFilesAndFolders()) || [];

  return (
    <div className="w-full">
      <FileBrowser initialFiles={allItems} folderId={folderId} />
    </div>
  );
}
