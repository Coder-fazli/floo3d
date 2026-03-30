import { getHomeImages } from "@/lib/actions";
import HomePageAdmin from "./HomePageAdmin";

export default async function AdminHomePage() {
  const images = await getHomeImages();
  return <HomePageAdmin images={images} />;
}
