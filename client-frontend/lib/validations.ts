import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("Podaj prawidłowy adres e-mail."),
  password: z.string().min(1, "Hasło jest wymagane."),
});

export const RegisterSchema = z.object({
  email: z.email("Podaj prawidłowy adres e-mail."),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków.")
    .regex(/[A-Za-z]/, "Hasło musi zawierać literę.")
    .regex(/[0-9]/, "Hasło musi zawierać cyfrę."),
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki.").trim(),
  surname: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki.").trim(),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{9,15}$/.test(value),
      "Telefon musi mieć 9–15 cyfr.",
    ),
});

export const ConfirmSchema = z.object({
  email: z.email("Podaj prawidłowy adres e-mail."),
  confirmationCode: z
    .string()
    .trim()
    .min(4, "Wpisz kod potwierdzenia z e-maila."),
});

export const ResendCodeSchema = z.object({
  email: z.email("Podaj prawidłowy adres e-mail."),
});

export type AuthFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  success?: boolean;
  email?: string;
};

export const RedeemSchema = z.object({
  companyId: z.coerce.number().int().positive("Wybierz partnera."),
  pct: z.coerce
    .number()
    .int()
    .refine(
      (v) => [10, 30, 50, 100].includes(v),
      "Wybierz prawidłowy próg zniżki.",
    ),
});

export type RedeemFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  success?: boolean;
  voucherId?: number;
};
