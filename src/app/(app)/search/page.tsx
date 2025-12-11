import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FileBrowser from "../file-browser";
import { searchFiles } from "@/actions/files";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const results = q ? await searchFiles(q) : [];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground pb-0">
        <h2 className="text-lg font-semibold text-foreground">
          Search Results
        </h2>
        <span>
          for &quot;{q}&quot; • {results.length} items found
        </span>
      </div>
      <FileBrowser
        initialFiles={results}
        folderId={null} // Treat as root for now to avoid navigation confusion
        externalQuery={q} // Lock the search bar or show state?
        isSearchResults={true}
      />
    </div>
  );
}
