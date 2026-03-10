
  import VisualizerClient from "./VisualizerClient";
  import { getProject } from "@/lib/actions";

  export async function generateMetadata({ params }: 
    {params: Promise<{ id: string }>})
  {
    const { id } = await params;
    const project = await getProject(id);


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