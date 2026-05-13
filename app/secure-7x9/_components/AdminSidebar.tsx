"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { LayoutDashboard, Users, Building2, FileText, Settings, ImageIcon, Home, PenSquare, Cpu, ScrollText, Tag, TrendingUp, Send } from "lucide-react";

const links = [
  { href: "/secure-7x9", label: "Overview", icon: LayoutDashboard },
  { href: "/secure-7x9/users", label: "Users", icon: Users },
  { href: "/secure-7x9/projects", label: "Projects", icon: Building2 },
  { href: "/secure-7x9/posts", label: "Posts", icon: FileText },
  { href: "/secure-7x9/frames", label: "Frames", icon: ImageIcon },
  { href: "/secure-7x9/home", label: "Home Page", icon: Home },
  { href: "/secure-7x9/floor-plan-generator", label: "Floor Plan Gen", icon: PenSquare },
  { href: "/secure-7x9/models", label: "AI Models", icon: Cpu },
  { href: "/secure-7x9/logs", label: "Logs", icon: ScrollText },
  { href: "/secure-7x9/pricing", label: "Pricing", icon: Tag },
  { href: "/secure-7x9/business", label: "Business", icon: TrendingUp },
  { href: "/secure-7x9/campaigns", label: "Campaigns", icon: Send },
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
        <Image src="/logo.png" alt="MyHomeStyler" width={120} height={40} style={{ objectFit: "contain", objectPosition: "left" }} />
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
