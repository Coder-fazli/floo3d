import { getAllLogs } from "@/lib/actions.admin";
import LogsClient from "./LogsClient";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const logs = await getAllLogs(500);
  return <LogsClient logs={logs} />;
}
