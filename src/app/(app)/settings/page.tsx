import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/app/(app)/settings/settings-form";
import { headers } from "next/headers";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  return <SettingsForm user={session.user} />;
}
