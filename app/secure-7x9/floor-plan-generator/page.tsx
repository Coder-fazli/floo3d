import { getFpgImages } from "@/lib/actions";
import FloorPlanGeneratorAdmin from "./FloorPlanGeneratorAdmin";

export default async function FloorPlanGeneratorAdminPage() {
  const images = await getFpgImages();
  return <FloorPlanGeneratorAdmin heroBeforeUrl={images.heroBeforeUrl} heroAfterUrl={images.heroAfterUrl} />;
}
