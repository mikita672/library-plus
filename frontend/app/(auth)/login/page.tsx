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
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { userContext } from "@/context/userContext"
import { loginFormSchema, LoginFormSchema } from "@/forms/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useContext, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

export default function page() {
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const { login, refreshUser, refreshFullUser } = useContext(userContext);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormSchema) => {
    const error = await login(data);
    if (error === null) {
      await refreshUser();
      await refreshFullUser();
      toast.success("Logged in successfully");
      router.replace("/");
    } else {
      toast.error("Failed to login", {
        description: `Reason: ${error}`,
      });
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet className="flex flex-col gap-6">
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      { ...field }
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="example@mail.com"
                      className="bg-background"
                      autoComplete="on"
                      type="email"
                      required
                      autoFocus
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <InputGroup
                      className="bg-background"
                    >
                      <InputGroupInput
                        { ...field }
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Your password goes here"
                        autoComplete="off"
                        type={showPassword ? "text" : "password"}
                        required
                        autoFocus
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => setShowPassword(prev => !prev)}
                        >
                          {showPassword ? <EyeClosedIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button
          form="login-form"
          type="submit"
          className="w-full cursor-pointer"
        >Login</Button>

        <div className="flex flex-col gap-2 items-center">
          <Link href="/sign-up" className="underline">Dont have an account yet?</Link>
          <Link href="/password-reset" className="underline">Forgot your password?</Link>
        </div>
      </CardFooter>
    </Card>
  )
}
