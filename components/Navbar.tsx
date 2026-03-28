"use client";

import { Zap, Menu, X, User } from "lucide-react";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getCredits } from "@/lib/actions";
import "./Navbar.css";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) getCredits(user.id).then(setCredits);
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
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {isSignedIn ? (
            <>
              <div className="navbar-credits">
                <Zap className="credits-icon" />
                <span>{credits ?? 10}</span>
              </div>
              <a href="/dashboard/profile" className="navbar-profile" title="Profile">
                <User className="w-4 h-4" />
              </a>
              <a href="/dashboard" className="navbar-btn-primary">Dashboard</a>
              <button className="navbar-btn-ghost" onClick={handleSignOut}>Log Out</button>
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
              <>
                <li><a href="/dashboard" onClick={() => setMenuOpen(false)} className="navbar-mobile-dashboard">Dashboard</a></li>
                <li><a href="/dashboard/profile" onClick={() => setMenuOpen(false)}>Profile</a></li>
                <li><a href="#" onClick={() => { handleSignOut(); setMenuOpen(false); }}>Log Out</a></li>
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
  );
};

export default Navbar;
