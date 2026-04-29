import { getAllUSers, getAllProjects } from "@/lib/actions.admin";
import { UsersTable } from "./UsersTable";

export default async function AdminUsers() {
  const [users, projects] = await Promise.all([getAllUSers(), getAllProjects()]);
  const projectCountByUser: Record<string, number> = {};
  for (const p of projects) {
    projectCountByUser[p.userId] = (projectCountByUser[p.userId] ?? 0) + 1;
  }
  return (
    <div className="adm-content">
      <UsersTable users={users} projectCountByUser={projectCountByUser} />
    </div>
  );
}
