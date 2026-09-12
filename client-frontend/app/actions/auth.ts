"use server";

import { redirect } from "next/navigation";

import { ApiError, confirmRegistration, register, resendConfirmationCode } from "@/lib/api";
import { loginAndCreateSession, logoutCurrentUser } from "@/lib/auth";
import {
  ConfirmSchema,
  LoginSchema,
  RegisterSchema,
  ResendCodeSchema,
  type AuthFormState,
} from "@/lib/validations";

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await loginAndCreateSession(parsed.data.email, parsed.data.password);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        return {
          message: "Konto nie zostało jeszcze potwierdzone. Sprawdź e-mail z kodem.",
          email: parsed.data.email,
        };
      }
      if (error.status === 401) {
        return { message: "Nieprawidłowy e-mail lub hasło." };
      }
      return { message: error.message };
    }
    return { message: "Nie udało się zalogować. Spróbuj ponownie." };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    surname: formData.get("surname"),
    phoneNumber: formData.get("phoneNumber") ?? "",
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password, name, surname, phoneNumber } = parsed.data;

  try {
    await register({
      email,
      password,
      name,
      surname,
      ...(phoneNumber ? { phoneNumber: Number(phoneNumber) } : {}),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        return { message: "Konto z tym adresem e-mail już istnieje." };
      }
      return { message: error.message };
    }
    return { message: "Nie udało się założyć konta. Spróbuj ponownie." };
  }

  redirect(`/confirm?email=${encodeURIComponent(email)}`);
}

export async function confirmAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = ConfirmSchema.safeParse({
    email: formData.get("email"),
    confirmationCode: formData.get("confirmationCode"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await confirmRegistration(
      parsed.data.email,
      parsed.data.confirmationCode,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        message: error.message || "Nieprawidłowy lub wygasły kod potwierdzenia.",
      };
    }
    return { message: "Nie udało się potwierdzić konta. Spróbuj ponownie." };
  }

  redirect(`/login?confirmed=1&email=${encodeURIComponent(parsed.data.email)}`);
}

export async function resendCodeAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = ResendCodeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await resendConfirmationCode(parsed.data.email);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message };
    }
    return { message: "Nie udało się wysłać kodu. Spróbuj ponownie." };
  }

  return {
    success: true,
    message: "Wysłaliśmy nowy kod potwierdzenia na Twój e-mail.",
    email: parsed.data.email,
  };
}

export async function logoutAction() {
  await logoutCurrentUser();
  redirect("/");
}
