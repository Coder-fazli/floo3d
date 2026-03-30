import { getAllProjects } from "@/lib/actions";
import ProjectsClient from "./ProjectsClient";

export default async function AdminProjects() {
  const projects = await getAllProjects();
  return <ProjectsClient projects={projects} />;
}
