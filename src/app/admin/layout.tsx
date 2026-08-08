import { Suspense } from "react";
import { AppRouteFallback } from "@/shared/components/AppRouteFallback/AppRouteFallback";
import { AdminAreaLayoutShell } from "./AdminAreaLayoutShell";

export const dynamic = "force-dynamic";

export default function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppRouteFallback />}>
      <AdminAreaLayoutShell>{children}</AdminAreaLayoutShell>
    </Suspense>
  );
}
