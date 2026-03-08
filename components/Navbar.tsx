"use client";

import { Zap } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getCredits } from "@/lib/actions";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);

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
                <span className="credits-divider">|</span>
                <span className="credits-plan">Free</span>
              </div>
              <span className="greeting">
                {user?.firstName ? `Hi, ${user.firstName}` : "Signed in"}
              </span>
              <Button size="sm" onClick={handleAuthClick} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={handleAuthClick} className="login">
              Log In
            </Button>
          )}

          <a 
            href={isSignedIn ? "#upload" : undefined} 
            onClick={!isSignedIn ? () => openSignIn() : undefined}
            className="cta"
          >
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
