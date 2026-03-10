"use client";

import { Zap, Menu, X, User } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getCredits } from "@/lib/actions";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getCredits(user.id).then(setCredits);
    }
  }, [user]);

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (e) {
        console.error(`Sign out failed: ${e}`);
      }
    } else {
      try {
        openSignIn();
      } catch (e) {
        console.error(`Sign in failed: ${e}`);
      }
    }
  };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Image src="/logo.png" alt="Floo3D Logo" width={100} height={100} className="logo" />
            <span className="name">Floo3D</span>
          </div>
          <ul className="links">
            <li><a href="">Product</a></li>
            <li><a href="">Pricing</a></li>
            <li><a href="">Community</a></li>
            <li><a href="">Enterprise</a></li>
          </ul>
        </div>

        <div className="actions">
          {isSignedIn ? (
            <>
              <div className="credits">
                <Zap className="credits-icon" />
                <span className="credits-count">{credits ?? 10}</span>
                <span className="credits-divider hidden-mobile">|</span>
                <span className="credits-plan hidden-mobile">Free</span>
              </div>
              <span className="greeting hidden-mobile">
                {user?.firstName ? `Hi, ${user.firstName}` : "Signed in"}
              </span>
              <a href="/dashboard/profile" className="profile-icon" title="Profile">
                <User className="w-5 h-5" />
              </a>
              <Button size="sm" onClick={handleAuthClick} className="btn hidden-mobile">
                Log Out
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={handleAuthClick} className="login">
              Log In
            </Button>
          )}

           {!isSignedIn && (
                 <a                                            
                  onClick={() => openSignIn()}    
                 className="cta hidden-mobile" >
                   Get started
                 </a>
           )}
           
          <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            <li><a href="" onClick={() => setMenuOpen(false)}>Product</a></li>
            <li><a href="" onClick={() => setMenuOpen(false)}>Pricing</a></li>
            <li><a href="" onClick={() => setMenuOpen(false)}>Community</a></li>
            <li><a href="" onClick={() => setMenuOpen(false)}>Enterprise</a></li>
            {isSignedIn && (
              <>
                <li><a href="/dashboard/profile" onClick={() => setMenuOpen(false)}>Profile</a></li>
                <li><a href="#" onClick={() => { handleAuthClick(); setMenuOpen(false); }}>Log Out</a></li>
              </>
            )}
            {!isSignedIn && (
              <li>
                <a href={isSignedIn ? "/dashboard" : undefined}
                  onClick={!isSignedIn ? () => { openSignIn(); setMenuOpen(false); } : undefined}>
                  Get started
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
