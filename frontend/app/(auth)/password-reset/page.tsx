"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { userContext } from "@/context/userContext"
import { passwordResetFormSchema, PasswordResetFormSchema } from "@/forms/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

export default function page() {
  const form = useForm<PasswordResetFormSchema>({
    resolver: zodResolver(passwordResetFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });
  const { resetPassword } = useContext(userContext);
  const router = useRouter();

  const onSubmit = async (data: PasswordResetFormSchema) => {
    const error = await resetPassword(data);
    if (error === null) {
      toast.success("Check your email");
      router.push("/login");
      return;
    }
    toast.error("Failed to reset password", {
      description: `Reason: ${error}`,
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          We will send you a password reset link via email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="password-reset-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet className="flex flex-col gap-6">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="example@mail.com"
                    className="bg-background"
                    autoComplete="off"
                    type="email"
                    required
                    autoFocus
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldSet>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button
          form="password-reset-form"
          type="submit"
          className="w-full
          cursor-pointer"
        >Reset password</Button>

        <div className="flex flex-col gap-2 items-center">
          <Link href="/login" className="underline">Go back to the login page</Link>
        </div>
      </CardFooter>
    </Card>
  )
}
