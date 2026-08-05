import { Suspense } from "react";
import { AppRouteFallback } from "@/shared/components/AppRouteFallback/AppRouteFallback";
import { HerdTracePageContent } from "./HerdTracePageContent";

type PageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default function HerdTraceRoutePage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<AppRouteFallback />}>
      <HerdTracePageContent searchParams={searchParams} />
    </Suspense>
  );
}
