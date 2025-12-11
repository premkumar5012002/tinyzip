import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <Spinner />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
