import { Suspense } from "react";
import { requireAdminContext, requireSession } from "@/lib/auth/server-context";
import { AdminAppLayout } from "@/shared/components/AppShell/AdminAppLayout";
import { AppRouteFallback } from "@/shared/components/AppRouteFallback/AppRouteFallback";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminContext();
  const session = await requireSession();

  return (
    <AdminAppLayout userName={session.fullName}>
      <Suspense fallback={<AppRouteFallback />}>{children}</Suspense>
    </AdminAppLayout>
  );
}
