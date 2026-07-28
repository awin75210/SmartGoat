import { requireAdminContext, requireSession } from "@/lib/auth/server-context";
import { AdminAppLayout } from "@/shared/components/AppShell/AdminAppLayout";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminContext();
  const session = await requireSession();

  return <AdminAppLayout userName={session.fullName}>{children}</AdminAppLayout>;
}
