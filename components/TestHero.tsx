"use client";

import { motion, Variants } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import "./TestHero.css";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const imgVariant: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const float = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const AVATARS = [
  "/avatars/female1.jpg",
  "/avatars/female3.jpg",
  "/avatars/av2.jpg",
  "/avatars/female2.jpg",
  "/avatars/av5.jpg",
];

const IMAGES = [
  "/card-room-after.webp",
  "/fp-after-1.jpg",
  "/card-outdoor-after.webp",
];

export default function TestHero() {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignUp } = useClerk();

  return (
    <section className="th-section">


      <div className="th-grid">

        {/* ── Left: Content ── */}
        <motion.div
          className="th-content"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="th-heading" variants={item}>
            AI-Powered<br />
            <span className="th-heading-accent">Interior Styler</span><br />
            for Any Space.
          </motion.h1>

          <motion.p className="th-sub" variants={item}>
            Upload a photo. Get a pro redesign in seconds.
          </motion.p>

          <motion.div className="th-btns" variants={item}>
            {!isLoaded ? null : isSignedIn ? (
              <Link href="/dashboard" className="th-btn-primary">Try It Free</Link>
            ) : (
              <button className="th-btn-primary" onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}>
                Try It Free
              </button>
            )}
            <Link href="/#reviews" className="th-btn-secondary">See Examples</Link>
          </motion.div>

          {/* Trust row */}
          <motion.div className="th-trust" variants={item}>
            <div className="th-avatars">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="user" className="th-avatar" style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 5 - i }} />
              ))}
            </div>
            <p className="th-trust-text">
              Trusted by <strong>2,500+</strong> architects &amp; designers
            </p>
          </motion.div>
        </motion.div>

        {/* ── Right: Collage ── */}
        <motion.div
          className="th-collage"
          variants={imgVariant}
          initial="hidden"
          animate="visible"
        >
          <picture>
            <source media="(max-width: 1024px)" srcSet="/th-collage-mobile.png" />
            <img src="/th-collage.png" alt="Before and after redesign" className="th-collage-img" />
          </picture>
        </motion.div>

      </div>
    </section>
  );
}
