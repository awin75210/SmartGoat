import { LoginPageView } from "@/features/auth/components/LoginPageView";

type LoginPageContentProps = {
  searchParams: Promise<{ error?: string }>;
};

export async function LoginPageContent({ searchParams }: LoginPageContentProps) {
  const { error } = await searchParams;
  return <LoginPageView error={error} />;
}
