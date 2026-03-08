
  import VisualizerClient from "./VisualizerClient";
  import { getProject } from "@/lib/actions";

  export async function generateMetadata({ params }: {params: { id: string }})
  {
    const project = await getProject(params.id);

    return {
        title: project?.name || "Floo3D Render",
      description: "View this 3D floor plan render on Floo3D",
      openGraph: {
        title: project?.name || "Floo3D Render",
        description: "View this 3D floor plan render on Floo3D",
        images: project?.renderedImageUrl ?
           [project.renderedImageUrl] : [],
    },
  };
}

export default function Page(){
    return <VisualizerClient />;
}