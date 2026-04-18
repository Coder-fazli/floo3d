"use client";

import { Zap, Menu, X, User, LogIn } from "lucide-react";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/actions";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import "./Navbar.css";
import ContactModal from "./ContactModal";

const NAV_LINKS = [
  { href: "#gallery",  label: "Gallery"  },
  { href: "#magic",    label: "Magic"    },
  { href: "#reviews",  label: "Love"     },
  { href: "#journal",  label: "Journal"  },
  { href: "#answers",  label: "Answers"  },
  { href: "/pricing",  label: "Pricing"  },
];

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
    <header className="navbar">
      <nav className="navbar-inner">

        {/* Brand */}
        <a href="/" className="navbar-brand">
          <div className="navbar-logo-icon">
            <Image src="/favicon.png" alt="MyHomeStyler" width={40} height={40} />
          </div>
          <span className="navbar-name">MyHome<span className="navbar-name-accent">Styler</span></span>
        </a>

        {/* Desktop nav using NavigationMenu */}
        <NavigationMenu className="navbar-desktop-only">
          <NavigationMenuList className="gap-0">
            {NAV_LINKS.map(({ href, label }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink
                  href={href}
                  className="navbar-nav-link"
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Actions */}
        <div className="navbar-actions">
          {isSignedIn ? (
            <>
              <div className="navbar-credits navbar-desktop-only">
                <Zap className="credits-icon" />
                <span>{credits ?? 4}</span>
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
              <button className="navbar-btn-ghost navbar-desktop-only" onClick={() => setContactOpen(true)}>Support</button>
              <a href="/dashboard" className="navbar-btn-primary navbar-desktop-only">Dashboard</a>

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
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}><a href={href} onClick={() => setMenuOpen(false)}>{label}</a></li>
            ))}
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
  );
};

export default Navbar;
