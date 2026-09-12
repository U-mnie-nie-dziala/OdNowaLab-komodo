import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Logowanie",
};

type LoginPageProps = {
  searchParams: Promise<{ email?: string; confirmed?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <AuthShell
      bullets={[
        "Sprawdzaj saldo Monet Wołomińskich",
        "Śledź historię zakupów i zniżek",
        "Wspieraj lokalne sklepy w Wołominie",
      ]}
    >
      <LoginForm
        defaultEmail={params.email ?? ""}
        confirmed={params.confirmed === "1"}
      />
    </AuthShell>
  );
}
