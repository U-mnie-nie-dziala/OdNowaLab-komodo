import type { ReactNode } from "react";

import { DashboardShell } from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <DashboardShell
      userName={`${user.name} ${user.surname}`}
      email={user.email}
      coins={user.coins}
    >
      {children}
    </DashboardShell>
  );
}
