import { getModelSettings } from "@/lib/actions";
import ModelsAdmin from "./ModelsAdmin";

export default async function ModelsPage() {
  const models = await getModelSettings();
  return <ModelsAdmin initialModels={models} />;
}
