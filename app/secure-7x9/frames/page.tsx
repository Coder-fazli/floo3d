import { getAppFrames } from "@/lib/actions";
import FramesClient from "./FramesClient";

export default async function AdminFrames() {
  const frames = await getAppFrames();
  return <FramesClient initialFrames={frames} />;
}
