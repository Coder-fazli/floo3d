"use client";

import { Zap, Menu, X, User, LogIn } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/actions";
import "./Navbar.css";
import ContactModal from "./ContactModal";
import { useTranslations, useLocale } from "next-intl";
import { Link as LocaleLink } from "@/i18n/navigation";
// switchLocale uses window.location directly — works on all pages incl. non-locale routes

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const t = useTranslations("nav");
  useLocale(); // keep provider in sync but don't rely on it for active state

  // Active locale: URL prefix wins on locale routes (home / blog posts),
  // otherwise the preferred-locale cookie decides.
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/ar" || path.startsWith("/ar/")) {
      setIsAr(true);
    } else if (path === "/") {
      setIsAr(false);
    } else {
      setIsAr(/(?:^|;\s*)preferred-locale=ar/.test(document.cookie));
    }
  }, []);

  const switchLocale = (next: "en" | "ar") => {
    // Always remember the choice in a cookie (used by non-locale pages).
    document.cookie = `preferred-locale=${next}; path=/; max-age=31536000`;
    const cur = window.location.pathname;
    const onLocaleRoute = cur === "/" || cur === "/ar" || cur.startsWith("/ar/");
    if (onLocaleRoute) {
      // Home / blog posts have real /ar URLs — switch the URL.
      if (next === "ar") {
        window.location.href = cur.startsWith("/ar") ? cur : "/ar" + (cur === "/" ? "" : cur);
      } else {
        window.location.href = cur.replace(/^\/ar(?=\/|$)/, "") || "/";
      }
    } else {
      // Static / app pages translate via the cookie — just reload.
      window.location.reload();
    }
  };

  useEffect(() => {
    if (!user) return;
    getUserInfo(user.id).then(d => setCredits(d.credits));
  }, [user]);

  useEffect(() => {
    if (!user || !window.location.search.includes("success=1")) return;
    let attempts = 0;
    let lastCredits: number | null = null;
    const interval = setInterval(async () => {
      attempts++;
      const d = await getUserInfo(user.id);
      if (lastCredits === null) { lastCredits = d.credits; }
      if (d.credits > (lastCredits ?? 0)) { setCredits(d.credits); clearInterval(interval); }
      if (attempts >= 5) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    try { await signOut(); } catch (e) { console.error(e); }
  };


  // Tool pages have real /ar URLs — prefix internal links when Arabic.
  const toolPrefix = isAr ? "/ar" : "";

  return (
    <>
    <header className="navbar">
      <nav className="navbar-inner">

        {/* Brand */}
        <LocaleLink href="/" className="navbar-brand">
          <img src="/logo.png" alt="MyHomeStyler" className="navbar-logo-img" />
          <span className="navbar-name">MyHome<span className="navbar-name-accent">Styler</span></span>
        </LocaleLink>

        {/* Desktop links */}
        <ul className="navbar-links">
          <li className="navbar-dropdown-wrap">
            <button className="navbar-links-btn navbar-dropdown-trigger">
              {t("tools")}
              <svg className="navbar-dropdown-chevron" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-inner">
                <a href={`${toolPrefix}/2d-to-3d-floor-plan-converter`} target="_blank" rel="noopener noreferrer" className="navbar-dropdown-item">
                  <span className="navbar-dropdown-item-title">{t("converter")}</span>
                  <span className="navbar-dropdown-item-desc">{t("converterDesc")}</span>
                </a>
                <a href={`${toolPrefix}/floor-plan-generator`} target="_blank" rel="noopener noreferrer" className="navbar-dropdown-item">
                  <span className="navbar-dropdown-item-title">{t("floorPlan")}</span>
                  <span className="navbar-dropdown-item-desc">{t("floorPlanDesc")}</span>
                </a>
              </div>
            </div>
          </li>
          <li><a href="/pricing">{t("pricing")}</a></li>
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {isSignedIn ? (
            <>
              <div className="navbar-credits navbar-desktop-only">
                <Zap className="credits-icon" />
                <span>{credits ?? 2}</span>
              </div>
              <div className="navbar-profile-wrap navbar-desktop-only">
                <button className="navbar-profile" onClick={() => setProfileOpen(p => !p)} title="Account">
                  <User className="w-4 h-4" />
                </button>
                {profileOpen && (
                  <div className="navbar-profile-dropdown">
                    <a href="/dashboard/profile" className="navbar-profile-item" onClick={() => setProfileOpen(false)}>{t("profile")}</a>
                    <button className="navbar-profile-item navbar-profile-item--danger" onClick={() => { setProfileOpen(false); handleSignOut(); }}>{t("signOut")}</button>
                  </div>
                )}
              </div>
              <a href="/dashboard" className="navbar-btn-primary navbar-desktop-only">{t("dashboard")}</a>

              <div className="navbar-mobile-group">
                <div className="navbar-credits-mobile">
                  <Zap size={13} />
                  <span>{credits ?? 2}</span>
                </div>
                <a href="/dashboard" className="navbar-icon-btn" title="Go to Dashboard">
                  <LogIn size={20} />
                </a>
              </div>
            </>
          ) : (
            <>
              <button className="navbar-btn-ghost" onClick={() => openSignIn({ fallbackRedirectUrl: "/dashboard" })}>
                {t("login")}
              </button>
              <button className="navbar-btn-primary" onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}>
                {t("signUp")}
              </button>
            </>
          )}

          {/* Language switcher — segmented: shows current, click other to switch */}
          <div className="navbar-lang-toggle">
            <button
              className={`navbar-lang-opt${!isAr ? " active" : ""}`}
              onClick={() => switchLocale("en")}
            >EN</button>
            <button
              className={`navbar-lang-opt${isAr ? " active" : ""}`}
              onClick={() => switchLocale("ar")}
            >عربي</button>
          </div>

          <button className="navbar-burger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="navbar-mobile">
          <ul>
            <li><a href={`${toolPrefix}/2d-to-3d-floor-plan-converter`} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>{t("converter")}</a></li>
            <li><a href={`${toolPrefix}/floor-plan-generator`} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>{t("floorPlan")}</a></li>
            <li><a href="/pricing" onClick={() => setMenuOpen(false)}>{t("pricing")}</a></li>
            {isSignedIn ? (
              <>
                <li><a href="/dashboard/profile" onClick={() => setMenuOpen(false)}>{t("profile")}</a></li>
              </>
            ) : (
              <li>
                <a href="#" onClick={() => { openSignUp({ fallbackRedirectUrl: "/dashboard" }); setMenuOpen(false); }}>
                  {t("signUp")}
                </a>
              </li>
            )}
            <li style={{ display: "flex", gap: "0.5rem", padding: "0.5rem 0" }}>
              <button className={`navbar-lang-opt${!isAr ? " active" : ""}`} onClick={() => { switchLocale("en"); setMenuOpen(false); }}>EN</button>
              <button className={`navbar-lang-opt${isAr ? " active" : ""}`} onClick={() => { switchLocale("ar"); setMenuOpen(false); }}>عربي</button>
            </li>
          </ul>
        </div>
      )}
    </header>

    {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
};

export default Navbar;
