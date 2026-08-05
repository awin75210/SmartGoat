import { Suspense } from "react";
import { LoginPageView } from "@/features/auth/components/LoginPageView";
import { LoginPageContent } from "./LoginPageContent";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default function LoginPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoginPageView />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}
