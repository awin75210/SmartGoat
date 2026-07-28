import { notFound } from "next/navigation";
import { requireFarmContext } from "@/lib/auth/server-context";
import { AppError } from "@/lib/errors/app-error";
import { herdService } from "@/features/herd/services/herd.service";
import { GoatDetail } from "@/features/herd/components/GoatDetail";

type PageProps = {
  params: Promise<{ goatId: string }>;
};

export default async function GoatDetailPage({ params }: PageProps) {
  const { farmId } = await requireFarmContext();
  const { goatId } = await params;

  let goat;
  try {
    goat = await herdService.getGoat(farmId, goatId);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return <GoatDetail goat={goat} />;
}
