import * as z from 'zod'

export const loginFormSchema = z.object({
  email: z.email("Must be a valid email"),
  password: z
    .string()
    .nonempty("Password is required")
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;

export const signUpformSchema = z.object({
  email: z.email("Must be a valid email"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Must be at least 8 character long")
    .max(64, "Must be shorter than 64 characters")
    .regex(/[a-z]/, "Must include at least 1 lowercase character")
    .regex(/[A-Z]/, "Must include at least 1 uppercase character")
    .regex(/[0-9]/, "Must include at least 1 digit")
    .regex(/[^a-zA-Z0-9]/, "Must include at least 1 special character"),
  passwordConfirmation: z.string(),
}).superRefine(({ password, passwordConfirmation }, ctx) => {
  if (password !== passwordConfirmation) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["passwordConfirmation"],
    })
  }
});

export type SignUpFormSchema = z.infer<typeof signUpformSchema>;

export const passwordResetFormSchema = z.object({
  email: z.email("Must be a valid email")
});

export type PasswordResetFormSchema = z.infer<typeof passwordResetFormSchema>;
