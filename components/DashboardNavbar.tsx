"use client";

import "./DashboardNavbar.css";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/actions";
import { Search, Bell, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardNavbar() {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserInfo(user.id).then(d => {
      setCredits(d.credits);
      setHasPurchased(d.hasPurchased);
    });
  }, [user]);

  return (
    <header className="dbnav">
      <div className="dbnav-inner">

        {/* Left: logo + links */}
        <div className="dbnav-left">
          <Link href="/" className="dbnav-brand">
            <div className="dbnav-logo-icon">
              <Image src="/favicon.png" alt="MyHomeStyler" width={40} height={40} />
            </div>
            <span className="dbnav-logo-name">MyHome<span className="dbnav-logo-accent">Styler</span></span>
          </Link>
          <nav className="dbnav-links">
            <a href="#" className="dbnav-link">Gallery</a>
            <Link href="/pricing" className="dbnav-link">Pricing</Link>
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
            <span>{credits !== null ? `${credits} Credits` : "Loading…"}</span>
          </div>

          <div className="dbnav-divider" />

          <button className="dbnav-signout" onClick={() => signOut({ redirectUrl: "/" })}>Log Out</button>

          <button className="dbnav-user" onClick={() => openUserProfile()}>
            <div className="dbnav-user-info">
              <p className="dbnav-user-name">{user?.username ?? "User"}</p>
              <p className="dbnav-user-plan">{hasPurchased ? "Pro Plan" : "Free Plan"}</p>
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
