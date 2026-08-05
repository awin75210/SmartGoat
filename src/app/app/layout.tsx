import { Suspense } from "react";
import { AppRouteFallback } from "@/shared/components/AppRouteFallback/AppRouteFallback";
import { AppAreaLayoutShell } from "./AppAreaLayoutShell";

export default function AppAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppRouteFallback />}>
      <AppAreaLayoutShell>{children}</AppAreaLayoutShell>
    </Suspense>
  );
}
