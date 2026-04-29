"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    clerkId: string;
    name: string;
}

export function DeleteUserButton({ clerkId, name }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/delete-user", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerkId }),
            });
            if (!res.ok) throw new Error("Failed");
            router.refresh();
        } catch {
            alert("Failed to delete user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="adm-action-link adm-action-link-danger"
            onClick={handleDelete}
            disabled={loading}
        >
            {loading ? "Deleting…" : "Delete"}
        </button>
    );
}
