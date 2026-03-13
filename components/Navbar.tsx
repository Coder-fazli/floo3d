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
        <div className="navbar-brand">
          <div className="navbar-logo-icon">
            <Image src="/logo.png" alt="Floo3D" width={20} height={20} />
          </div>
          <span className="navbar-name">Floo<span className="navbar-name-accent">3D</span></span>
        </div>

        {/* Links */}
        <ul className="navbar-links">
          <li><a href="">Product</a></li>
          <li><a href="">Features</a></li>
          <li><a href="">Pricing</a></li>
          <li><a href="">Gallery</a></li>
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
            <li><a href="" onClick={() => setMenuOpen(false)}>Product</a></li>
            <li><a href="" onClick={() => setMenuOpen(false)}>Features</a></li>
            <li><a href="" onClick={() => setMenuOpen(false)}>Pricing</a></li>
            <li><a href="" onClick={() => setMenuOpen(false)}>Gallery</a></li>
            {isSignedIn ? (
              <>
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
