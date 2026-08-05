import { getAdminSessionOrRedirect } from "@/lib/auth/server-context";
import { AdminAppLayout } from "@/shared/components/AppShell/AdminAppLayout";

export async function AdminAreaLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSessionOrRedirect();

  return <AdminAppLayout userName={session.fullName}>{children}</AdminAppLayout>;
}
