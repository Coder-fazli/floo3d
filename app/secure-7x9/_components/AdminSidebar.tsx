"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { LayoutDashboard, Users, Building2, FileText, Settings } from "lucide-react";

const links = [
  { href: "/secure-7x9", label: "Overview", icon: LayoutDashboard },
  { href: "/secure-7x9/users", label: "Users", icon: Users },
  { href: "/secure-7x9/projects", label: "Projects", icon: Building2 },
  { href: "/secure-7x9/posts", label: "Posts", icon: FileText },
];

const systemLinks = [
  { href: "/secure-7x9/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) =>
    href === "/secure-7x9" ? pathname === "/secure-7x9" : pathname.startsWith(href);

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-brand">
        <div className="adm-sidebar-logo">
          <Image src="/logo.png" alt="Floo3D" width={32} height={32} />
        </div>
        <div>
          <p className="adm-sidebar-brand-name">Floo3D Admin</p>
          <p className="adm-sidebar-brand-sub">Management Panel</p>
        </div>
      </div>

      <nav className="adm-sidebar-nav">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`adm-nav-link ${isActive(href) ? "adm-nav-link-active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        <p className="adm-nav-section">System</p>

        {systemLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`adm-nav-link ${isActive(href) ? "adm-nav-link-active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="adm-sidebar-footer">
        <div className="adm-sidebar-user">
          <div className="adm-sidebar-avatar">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="avatar" />
            ) : (
              <span>{user?.firstName?.[0] ?? "A"}</span>
            )}
          </div>
          <div>
            <p className="adm-sidebar-user-name">{user?.firstName ?? "Admin"}</p>
            <p className="adm-sidebar-user-email">{user?.emailAddresses?.[0]?.emailAddress ?? "admin@floo3d.com"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
