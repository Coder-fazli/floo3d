"use client";

import "./AppSidebar.css";
import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { getUserInfo } from "@/lib/actions";
import { Home, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ContactModal from "./ContactModal";
import { useTranslations } from "next-intl";

export default function AppSidebar() {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const t = useTranslations("sidebar");

  const switchLang = () => {
    // Dashboard has no Arabic equivalent — navigate to locale home
    const isAr = window.location.pathname.startsWith("/ar");
    window.location.href = isAr ? "/" : "/ar";
  };

  useEffect(() => {
    if (!user) return;
    getUserInfo(user.id).then(d => {
      setCredits(d.credits);
      setHasPurchased(d.hasPurchased);
    });
  }, [user]);

  const isDashboard = pathname === "/dashboard";
  const isProjects  = pathname === "/projects";

  return (
    <>
    <nav className="viz-icon-nav">

      {/* ── Top: logo + nav links ── */}
      <div className="viz-icon-nav-top">
        <Link href="/dashboard" className="viz-icon-nav-logo" title="Dashboard">
          <div className="viz-icon-nav-logo-icon">
            <Image src="/favicon.png" alt="logo" width={36} height={36} />
          </div>
          <span className="viz-icon-nav-label viz-icon-nav-brand">
            MyHome<span style={{ color: "var(--brand-color)" }}>Styler</span>
          </span>
        </Link>

        <div className="viz-icon-nav-divider-line" />

        <Link href="/dashboard" className={`viz-icon-nav-item${isDashboard ? " viz-icon-nav-item-active" : ""}`}>
          <span className="viz-icon-nav-item-icon"><Home size={26} strokeWidth={1.6} /></span>
          <span className="viz-icon-nav-label">{t("dashboard")}</span>
        </Link>

        <Link href="/projects" className={`viz-icon-nav-item${isProjects ? " viz-icon-nav-item-active" : ""}`}>
          <span className="viz-icon-nav-item-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="3" width="7" height="7" rx="1.2"/>
              <rect x="14" y="3" width="7" height="7" rx="1.2"/>
              <rect x="3" y="14" width="7" height="7" rx="1.2"/>
              <rect x="14" y="14" width="7" height="7" rx="1.2"/>
            </svg>
          </span>
          <span className="viz-icon-nav-label">{t("myRenders")}</span>
        </Link>
      </div>

      {/* ── Bottom: credits + burger ── */}
      <div className="viz-icon-nav-bottom">

        <div className="viz-icon-nav-credits-card" onClick={() => window.open("/pricing", "_blank")} style={{ cursor: "pointer" }}>
          <div className="viz-icon-nav-credits-pill">
            <Zap size={14} strokeWidth={2.5} />
            <span className="viz-icon-nav-credits-num">{credits ?? "—"}</span>
          </div>
          <div className="viz-icon-nav-credits-info">
            <span className="viz-icon-nav-credits-count">{credits ?? "—"} {t("credits")}</span>
            <span className="viz-icon-nav-credits-action">{t("upgrade")}</span>
          </div>
        </div>

        <div className="viz-icon-nav-burger-wrap">
          <button className="viz-icon-nav-item" onClick={() => setBurgerOpen(o => !o)} title="Menu">
            <span className="viz-icon-nav-item-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
              </svg>
            </span>
            <span className="viz-icon-nav-label">{t("menu")}</span>
          </button>

          {burgerOpen && (
            <>
              <div className="viz-burger-backdrop" onClick={() => setBurgerOpen(false)} />
              <div className="viz-burger-menu">
                <button className="viz-burger-item" onClick={() => { openUserProfile(); setBurgerOpen(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  {t("accountSettings")}
                </button>
                <Link href="/dashboard/subscription" className="viz-burger-item" onClick={() => setBurgerOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  {t("mySubscription")}
                </Link>
                <Link href="/privacy-policy" className="viz-burger-item" onClick={() => setBurgerOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {t("privacyPolicy")}
                </Link>
                <button className="viz-burger-item" onClick={() => { setContactOpen(true); setBurgerOpen(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {t("support")}
                </button>
                <button className="viz-burger-item" onClick={switchLang}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  عربي / EN
                </button>
                <div className="viz-burger-divider" />
                <button className="viz-burger-item viz-burger-item-danger" onClick={() => signOut({ redirectUrl: "/" })}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {t("logOut")}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </nav>

    {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
}
