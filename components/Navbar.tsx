"use client";

import { Zap, Menu, X, User, LogIn } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/actions";
import "./Navbar.css";
import ContactModal from "./ContactModal";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

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

  return (
    <>
    <header className="navbar">
      <nav className="navbar-inner">

        {/* Brand */}
        <a href="/" className="navbar-brand">
          <img src="/logo.png" alt="MyHomeStyler" className="navbar-logo-img" />
          <span className="navbar-name">MyHome<span className="navbar-name-accent">Styler</span></span>
        </a>

        {/* Desktop links */}
        <ul className="navbar-links">
          <li className="navbar-dropdown-wrap">
            <button className="navbar-links-btn navbar-dropdown-trigger">
              Tools
              <svg className="navbar-dropdown-chevron" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-inner">
                <a href="/2d-to-3d-floor-plan-converter" target="_blank" rel="noopener noreferrer" className="navbar-dropdown-item">
                  <span className="navbar-dropdown-item-title">2D → 3D Converter</span>
                  <span className="navbar-dropdown-item-desc">Turn floor plans into 3D renders</span>
                </a>
                <a href="/floor-plan-generator" target="_blank" rel="noopener noreferrer" className="navbar-dropdown-item">
                  <span className="navbar-dropdown-item-title">Floor Plan Generator</span>
                  <span className="navbar-dropdown-item-desc">Generate floor plans with AI</span>
                </a>
              </div>
            </div>
          </li>
          <li><a href="#magic">Magic</a></li>
          <li><a href="#reviews">Love</a></li>
          <li><a href="#journal">Journal</a></li>
          <li><a href="#answers">Answers</a></li>
          <li><a href="/pricing">Pricing</a></li>
          {isSignedIn && <li><button className="navbar-links-btn" onClick={() => setContactOpen(true)}>Support</button></li>}
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
                    <a href="/dashboard/profile" className="navbar-profile-item" onClick={() => setProfileOpen(false)}>Profile</a>
                    <button className="navbar-profile-item navbar-profile-item--danger" onClick={() => { setProfileOpen(false); handleSignOut(); }}>Sign Out</button>
                  </div>
                )}
              </div>
              <a href="/dashboard" className="navbar-btn-primary navbar-desktop-only">Dashboard</a>

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
                Login
              </button>
              <button className="navbar-btn-primary" onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}>
                Sign Up
              </button>
            </>
          )}
          <button className="navbar-burger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="navbar-mobile">
          <ul>
            <li><a href="/2d-to-3d-floor-plan-converter" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>2D → 3D Converter</a></li>
            <li><a href="/floor-plan-generator" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Floor Plan Generator</a></li>
            <li><a href="#magic" onClick={() => setMenuOpen(false)}>Magic</a></li>
            <li><a href="#reviews" onClick={() => setMenuOpen(false)}>Love</a></li>
            <li><a href="#journal" onClick={() => setMenuOpen(false)}>Journal</a></li>
            <li><a href="#answers" onClick={() => setMenuOpen(false)}>Answers</a></li>
            <li><a href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</a></li>
            {isSignedIn ? (
              <>
                <li><a href="/dashboard/profile" onClick={() => setMenuOpen(false)}>Profile</a></li>
                <li><a href="#" onClick={() => { setContactOpen(true); setMenuOpen(false); }}>Support</a></li>
              </>
            ) : (
              <li>
                <a href="#" onClick={() => { openSignUp({ fallbackRedirectUrl: "/dashboard" }); setMenuOpen(false); }}>
                  Sign Up
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>

    {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
};

export default Navbar;
