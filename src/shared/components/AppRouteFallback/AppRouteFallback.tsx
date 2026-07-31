import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton/LoadingSkeleton";

export function AppRouteFallback() {
  return <LoadingSkeleton rows={6} />;
}
