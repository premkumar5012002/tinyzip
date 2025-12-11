import { LoginForm } from "./login-form";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session !== null) {
    return redirect("/");
  }

  return <LoginForm />;
}
