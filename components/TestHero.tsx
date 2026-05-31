"use client";

import { motion, Variants } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import "./TestHero.css";
import AutoCompareSlider from "./AutoCompareSlider";
import { CountUp } from "@/components/ui/count-up";
import { useTranslations } from "next-intl";

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
  const th = useTranslations("hero");
  const th2 = useTranslations("hero2");

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
            {th("line1")}<br />
            <span className="th-heading-accent">{th("accent")}</span><br />
            {th("line2")}
          </motion.h1>

          <motion.p className="th-sub" variants={item}>
            {th("sub")}
          </motion.p>

          <motion.div className="th-cta-group" variants={item}>
            <div className="th-btns">
              {isSignedIn ? (
                <Link href="/dashboard" className="th-btn-primary">{th2("ctaTry")}</Link>
              ) : (
                <button className="th-btn-primary" onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}>
                  {th2("ctaTry")}
                </button>
              )}
              <Link href="/#reviews" className="th-btn-secondary">{th2("ctaExamples")}</Link>
            </div>

            {/* Trust */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div style={{ display: "flex" }}>
                {AVATARS.map((src, i) => (
                  <div key={i} style={{
                    width: 38, height: 38, borderRadius: "9999px", overflow: "hidden",
                    border: "2px solid #ffffff",
                    marginLeft: i === 0 ? 0 : -10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    position: "relative", zIndex: 5 - i,
                  }}>
                    <Image src={src} alt="user" width={38} height={38} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <div style={{ display: "flex", gap: "0.2rem" }}>
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={13} fill="var(--brand-color)" stroke="none" />
                  ))}
                </div>
                <p style={{ fontSize: "0.78rem", color: "#475569", margin: 0, fontWeight: 500 }}>
                  {th2("trustedBy")}{" "}
                  <CountUp value={2500} duration={2} separator="," suffix="+" colorScheme="gradient" className="font-bold" />
                  {" "}{th2("trustedCount")}{" "}
                  <a href="/#reviews" style={{ color: "var(--brand-color)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "2px" }}>
                    {th2("happyUsers")}
                  </a>
                </p>
              </div>
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
