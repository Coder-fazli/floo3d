"use client";

import "./DashboardNavbar.css";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getCredits } from "@/lib/actions";
import { Search, Bell, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardNavbar() {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (user) getCredits(
      user.id,
      user.fullName ?? "",
      user.emailAddresses[0]?.emailAddress ?? ""
    ).then(setCredits);
  }, [user]);

  return (
    <header className="dbnav">
      <div className="dbnav-inner">

        {/* Left: logo + links */}
        <div className="dbnav-left">
          <Link href="/" className="dbnav-brand">
            <div className="dbnav-logo-icon">
              <Image src="/logo.png" alt="Floo3D" width={20} height={20} />
            </div>
            <span className="dbnav-logo-name">Floo<span className="dbnav-logo-accent">3D</span></span>
          </Link>
          <nav className="dbnav-links">
            <a href="/dashboard" className="dbnav-link dbnav-link-active">Projects</a>
            <a href="#" className="dbnav-link">Gallery</a>
            <a href="#" className="dbnav-link">Pricing</a>
            <a href="#" className="dbnav-link">Support</a>
          </nav>
        </div>

        {/* Right: search + actions */}
        <div className="dbnav-right">
          <div className="dbnav-search">
            <Search size={16} className="dbnav-search-icon" />
            <input className="dbnav-search-input" type="text" placeholder="Search projects..." />
          </div>

          <button className="dbnav-bell">
            <Bell size={18} />
            <span className="dbnav-bell-dot" />
          </button>

          <div className="dbnav-credits">
            <Zap size={14} className="dbnav-credits-icon" />
            <span>{credits ?? 10} Credits</span>
          </div>

          <div className="dbnav-divider" />

          <button className="dbnav-signout" onClick={() => signOut({ redirectUrl: "/" })}>Log Out</button>

          <button className="dbnav-user" onClick={() => openUserProfile()}>
            <div className="dbnav-user-info">
              <p className="dbnav-user-name">{user?.username ?? "User"}</p>
              <p className="dbnav-user-plan">Pro Plan</p>
            </div>
            <div className="dbnav-avatar">
              {user?.imageUrl ? (
                <Image src={user.imageUrl} alt="avatar" className="dbnav-avatar-img" width={32} height={32} />
              ) : (
                <span className="dbnav-avatar-fallback">
                  {user?.username?.[0]?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>
          </button>
        </div>

      </div>
    </header>
  );
}
