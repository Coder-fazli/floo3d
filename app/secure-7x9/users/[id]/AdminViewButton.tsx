"use client";

export default function AdminViewButton({ projectId }: { projectId: string }) {
  const handleClick = async () => {
    await fetch("/api/admin/view-project", { method: "POST" });
    window.open(`/visualizer/${projectId}`, "_blank");
  };

  return (
    <button className="adm-action-link" onClick={handleClick}>
      View as User
    </button>
  );
}
