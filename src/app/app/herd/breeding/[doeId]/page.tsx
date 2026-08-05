import { notFound } from "next/navigation";
import { requireFarmContext } from "@/lib/auth/server-context";
import { breedingDoeService } from "@/features/herd/services/breeding-doe.service";
import { BreedingDoeDetail } from "@/features/herd/components/breeding/BreedingDoeDetail";

type PageProps = {
  params: Promise<{ doeId: string }>;
};

export default async function BreedingDoeDetailRoutePage({ params }: PageProps) {
  const { doeId } = await params;
  const { farmId } = await requireFarmContext();

  const [doe, cycles] = await Promise.all([
    breedingDoeService.getDoe(farmId, doeId),
    breedingDoeService.listCycles(farmId, doeId),
  ]);

  if (!doe) notFound();

  return <BreedingDoeDetail doe={doe} cycles={cycles} />;
}
