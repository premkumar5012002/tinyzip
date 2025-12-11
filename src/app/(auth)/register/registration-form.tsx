"use client";

import { z } from "zod";
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
import { useForm, useStore } from "@tanstack/react-form";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import PasswordInput from "@/components/ui/password-input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be minimum 2 characters" })
    .max(255, { error: "Name should not be over 255 characters" }),
  email: z.email(),
  password: z
    .string()
    .min(8, { error: "Password must be minimum 8 characters" })
    .max(128, { error: "Password should not be over 128 characters" }),
});

export function RegistrationForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { name, email, password } = value;

      const { error } = await authClient.signUp.email({
        email,
        name,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      router.push("/");
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex flex-col items-center gap-2">
          <Image src="/tinyzip.svg" alt="tinyzip" width={50} height={50} />
          Register to Tinyzip.
        </CardTitle>
        <CardDescription>
          <p className="text-sm">
            Already have an account?{" "}
            <Link href="/login" className="hover:underline">
              Sign In
            </Link>
          </p>
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold"></h3>
              </div>
            </div>

            <FieldSet>
              <FieldGroup>
                <form.Field name="name">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          type="text"
                          placeholder="Enter your name"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

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

                <form.Field name="password">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <PasswordInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          type="password"
                          placeholder="Enter your password"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>

              <Button disabled={isSubmitting} className="w-full">
                {isSubmitting && <Spinner />} Register
              </Button>
            </FieldSet>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
