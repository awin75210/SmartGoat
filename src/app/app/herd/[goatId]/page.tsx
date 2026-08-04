import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ goatId: string }>;
};

export default async function LegacyGoatDetailRedirect({ params }: PageProps) {
  await params;
  redirect("/app/herd");
}
