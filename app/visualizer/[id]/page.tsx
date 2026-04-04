import { Suspense } from "react";
import VisualizerClient from "./VisualizerClient";
import { getProject, getAppFrames } from "@/lib/actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return { title: "New Project — MyHomeStyler" };
  const project = await getProject(id);
  return {
    title: project?.name || "MyHomeStyler Render",
    description: "View this 3D floor plan render on MyHomeStyler",
    robots: { index: false, follow: false },
    openGraph: {
      title: project?.name || "MyHomeStyler Render",
      description: "View this 3D floor plan render on MyHomeStyler",
      images: project?.renderedImageUrl ? [project.renderedImageUrl] : [],
    },
  };
}

export default async function Page() {
  const frames = await getAppFrames();
  return <Suspense><VisualizerClient frames={frames} /></Suspense>;
}