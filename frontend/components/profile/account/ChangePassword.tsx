"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().nonempty("Current password is required"),
    newPassword: z
      .string()
      .nonempty("Password is required")
      .min(8, "Must be at least 8 character long")
      .max(64, "Must be shorter than 64 characters")
      .regex(/(?=.*[a-z])/, "Must include at least 1 lowercase character")
      .regex(/(?=.*[A-Z])/, "Must include at least 1 uppercase character")
      .regex(/(?=.*[0-9])/, "Must include at least 1 digit")
      .regex(/(?=.*[^a-zA-Z0-9])/, "Must include at least 1 special character"),
    confirmPassword: z.string().nonempty("Please confirm your new password"),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type ChangePasswordFormSchema = z.infer<typeof changePasswordSchema>;

function ChangePassword() {
  const form = useForm<ChangePasswordFormSchema>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: ChangePasswordFormSchema) => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/user/updatePassword", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setServerError(errorData?.message ?? "Failed to update password");
        return;
      }

      form.reset();
    } catch {
      setServerError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Change password</h2>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-sm"
                      className="cursor-pointer"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                    >
                      {showCurrentPassword ? <EyeClosedIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-sm"
                      className="cursor-pointer"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                    >
                      {showNewPassword ? <EyeClosedIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Confirm new password
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-sm"
                      className="cursor-pointer"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <EyeClosedIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {serverError ? (
            <p className="text-sm text-red-600">{serverError}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Submit"}
          </Button>
        </FieldGroup>
      </form>
    </section>
  );
}

export default ChangePassword;
