"use client";

import { motion, Variants } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import "./TestHero.css";
import AutoCompareSlider from "./AutoCompareSlider";

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

export default function TestHero({ heroBeforeUrl, heroAfterUrl }: { heroBeforeUrl?: string | null; heroAfterUrl?: string | null }) {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignUp } = useClerk();

  const beforeSrc = heroBeforeUrl ?? "/hero-before.jpg";
  const afterSrc  = heroAfterUrl  ?? "/hero-after.jpg";

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
            <span className="th-heading-accent">Home Styler</span><br />
            for Any Space.
          </motion.h1>

          <motion.p className="th-sub" variants={item}>
            Upload a photo. Get a pro redesign in seconds.
          </motion.p>

          <motion.div className="th-cta-group" variants={item}>
            <div className="th-btns">
              {isSignedIn ? (
                <Link href="/dashboard" className="th-btn-primary">Try It Free</Link>
              ) : (
                <button className="th-btn-primary" onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}>
                  Try It Free
                </button>
              )}
              <Link href="/#reviews" className="th-btn-secondary">See Examples</Link>
            </div>

            {/* Trust — directly under buttons */}
            <div className="th-trust">
              <div className="th-avatars">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="user" className="th-avatar" style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 5 - i }} />
                ))}
              </div>
              <p className="th-trust-text">
                Trusted by <strong>2,500+</strong> architects &amp; designers
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right: Before/After Slider ── */}
        <motion.div
          className="th-collage"
          variants={imgVariant}
          initial="hidden"
          animate="visible"
        >
          <AutoCompareSlider before={beforeSrc} after={afterSrc} />
        </motion.div>

      </div>

    </section>
  );
}
