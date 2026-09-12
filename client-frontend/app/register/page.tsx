import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Rejestracja",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      bullets={[
        "Zbieraj Monety Wołomińskie za lokalne zakupy",
        "Wymieniaj monety na zniżki u partnerów",
        "Dołącz do społeczności powiatu wołomińskiego",
      ]}
    >
      <RegisterForm />
    </AuthShell>
  );
}
