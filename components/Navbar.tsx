"use client";

import { Zap, Menu, X, User, LogIn } from "lucide-react";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/actions";
import "./Navbar.css";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserInfo(user.id).then(d => setCredits(d.credits));
  }, [user]);

  // Poll credits after successful payment
  useEffect(() => {
    if (!user || !window.location.search.includes("success=1")) return;
    let attempts = 0;
    let lastCredits: number | null = null;
    const interval = setInterval(async () => {
      attempts++;
      const d = await getUserInfo(user.id);
      if (lastCredits === null) { lastCredits = d.credits; }
      if (d.credits > (lastCredits ?? 0)) {
        setCredits(d.credits);
        clearInterval(interval);
      }
      if (attempts >= 5) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    try { await signOut(); } catch (e) { console.error(e); }
  };

  return (
    <header className="navbar">
      <nav className="navbar-inner">

        {/* Brand */}
        <a href="/" className="navbar-brand">
          <div className="navbar-logo-icon">
            <Image src="/favicon.png" alt="MyHomeStyler" width={40} height={40} />
          </div>
          <span className="navbar-name">MyHome<span className="navbar-name-accent">Styler</span></span>
        </a>

        {/* Links */}
        <ul className="navbar-links">
          <li><a href="#gallery">Gallery</a></li>
          <li><a href="#magic">Magic</a></li>
          <li><a href="#reviews">Love</a></li>
          <li><a href="#journal">Journal</a></li>
          <li><a href="#answers">Answers</a></li>
          <li><a href="/pricing">Pricing</a></li>
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {isSignedIn ? (
            <>
              {/* Desktop only */}
              <div className="navbar-credits navbar-desktop-only">
                <Zap className="credits-icon" />
                <span>{credits ?? 4}</span>
              </div>
              <a href="/dashboard/profile" className="navbar-profile navbar-desktop-only" title="Profile">
                <User className="w-4 h-4" />
              </a>
              <a href="/dashboard" className="navbar-btn-primary navbar-desktop-only">Dashboard</a>
              <button className="navbar-btn-ghost navbar-desktop-only" onClick={handleSignOut}>Log Out</button>

              {/* Mobile only: credits + dashboard icon */}
              <div className="navbar-mobile-group">
                <div className="navbar-credits-mobile">
                  <Zap size={13} />
                  <span>{credits ?? 4}</span>
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
            <li><a href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a></li>
            <li><a href="#magic" onClick={() => setMenuOpen(false)}>Magic</a></li>
            <li><a href="#reviews" onClick={() => setMenuOpen(false)}>Love</a></li>
            <li><a href="#journal" onClick={() => setMenuOpen(false)}>Journal</a></li>
            <li><a href="#answers" onClick={() => setMenuOpen(false)}>Answers</a></li>
            {isSignedIn ? (
              <li><a href="/dashboard/profile" onClick={() => setMenuOpen(false)}>Profile</a></li>
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
  );
};

export default Navbar;
