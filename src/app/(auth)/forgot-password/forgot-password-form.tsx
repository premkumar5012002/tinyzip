"use client";

import { z } from "zod";
import { useForm, useStore } from "@tanstack/react-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.email(),
});

export function ForgotPasswordForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { email } = value;

      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("OTP sent to your email.");

      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex flex-col items-center gap-2">
          <Image src="/tinyzip.svg" alt="tinyzip" width={50} height={50} />
          Forgot Password
        </CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-6">
            <FieldSet>
              <FieldGroup>
                <form.Field name="email">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          type="email"
                          placeholder="Enter your email"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <Button disabled={isSubmitting} className="w-full">
              {isSubmitting && <Spinner />} Send Reset Link
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 hover:underline text-muted-foreground"
          >
            <ChevronLeft className="size-4" /> Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
