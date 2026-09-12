import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/AuthShell";
import { ConfirmForm } from "@/components/ConfirmForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Potwierdzenie e-mail",
};

type ConfirmPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <AuthShell
      bullets={[
        "Potwierdź e-mail, aby aktywować konto",
        "Zbieraj Monety Wołomińskie od razu po rejestracji",
        "Twoje dane są chronione przez AWS Cognito",
      ]}
    >
      <ConfirmForm defaultEmail={params.email ?? ""} />
    </AuthShell>
  );
}
