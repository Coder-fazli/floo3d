"use client";

import { useUser } from "@clerk/nextjs";

export default function AdminTopbar() {
  const { user } = useUser();

  return (
    <header className="adm-topbar">
      <div />
      <div className="adm-topbar-right">
        <div className="adm-topbar-user">
          <div className="adm-topbar-user-info">
            <p className="adm-topbar-user-name">{user?.firstName ?? "Admin"}</p>
            <p className="adm-topbar-user-role">Super Admin</p>
          </div>
          <div className="adm-topbar-avatar">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="avatar" />
            ) : (
              <span>{user?.firstName?.[0] ?? "A"}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
