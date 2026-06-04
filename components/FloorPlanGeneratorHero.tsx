"use client";

import "./HomePageHero.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage } from "react-compare-slider";
import { useClerk, useUser } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";

const features = [
  {
    title: "AI Floor Plan Generator",
    desc: "Pick your property type, area, floors, and rooms — our AI floor plan generator creates a professional layout in seconds. No design skills needed.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/>
        <path d="M12 4v16M4 12h16"/>
      </svg>
    ),
  },
  {
    title: "AI Blueprint Generator",
    desc: "Generate architectural-grade blueprints, colored room plans, or isometric 3D-style views. Our AI blueprint generator handles any property type.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
      </svg>
    ),
  },
  {
    title: "Generate Floor Plan Free",
    desc: "Create unlimited floor plan variations — house, apartment, villa, studio, or office. Free to start, no credit card, no software installation required.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    title: "Convert to 3D Instantly",
    desc: "Once your AI-generated floor plan is ready, convert it to a photorealistic 3D render in one click — no extra uploads, no extra tools.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
];

const STRINGS = {
  en: {
    badge: "AI Floor Plan Generator Free · No Login Required",
    h1: "AI Floor Plan", accent: "Generator", h3: "Free. Online. Instant.",
    sub: "Generate any floor plan from scratch with AI — no design skills, no software, no credit card. Configure your rooms, pick a style, and get a professional floor plan in seconds.",
    ctaPrimary: "Generate Free", ctaSecondary: "See How It Works",
    trustedPre: "Trusted by", trustedMid: "architects &", happyUsers: "happy users",
    floatLabel: "Floor Plan Generated", floatSub: "AI processed your layout in 1.8s",
  },
  ar: {
    badge: "مولّد مخططات المنازل بالذكاء الاصطناعي مجاناً · بدون تسجيل دخول",
    h1: "مولّد مخططات المنازل", accent: "بالذكاء الاصطناعي", h3: "مجاني. أونلاين. فوري.",
    sub: "أنشئ أي مخطط منزل من الصفر بالذكاء الاصطناعي — بدون مهارات تصميم، بدون برامج، بدون بطاقة ائتمان. حدّد غرفك، اختر الأسلوب، واحصل على مخطط احترافي في ثوانٍ.",
    ctaPrimary: "أنشئ مجاناً", ctaSecondary: "شاهد كيف يعمل",
    trustedPre: "موثوق من", trustedMid: "معماري و", happyUsers: "مستخدم سعيد",
    floatLabel: "تم إنشاء المخطط", floatSub: "عالج الذكاء الاصطناعي مخططك في 1.8 ثانية",
  },
  es: {
    badge: "Generador de Planos con IA Gratis · Sin Registro",
    h1: "Generador de Planos", accent: "con IA", h3: "Gratis. Online. Al Instante.",
    sub: "Crea cualquier plano desde cero con IA — sin conocimientos de diseño, sin software, sin tarjeta de crédito. Configura tus habitaciones, elige un estilo y obtén un plano profesional en segundos.",
    ctaPrimary: "Crear Gratis", ctaSecondary: "Ver Cómo Funciona",
    trustedPre: "La confianza de", trustedMid: "arquitectos y", happyUsers: "usuarios satisfechos",
    floatLabel: "Plano Generado", floatSub: "La IA procesó tu plano en 1,8 s",
  },
};

export default function FloorPlanGeneratorHero({
  heroBeforeUrl = "/real-2d-plan.jpg",
  heroAfterUrl  = "/real-3d-render.jpg",
  lang = "en",
}: {
  heroBeforeUrl?: string;
  heroAfterUrl?: string;
  lang?: "en" | "ar" | "es";
}) {
  const s = STRINGS[lang];
  const { isSignedIn } = useUser();
  const { openSignUp } = useClerk();
  const [sliderPos, setSliderPos] = useState(40);
  const sliderPosRef = useRef(40);
  const rafRef = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const STOPS = [92, 6];
    let stopIndex = 0;
    let fromPos = 40;
    let toPos = STOPS[0];
    let segStart = 0;
    let sweepDuration = 1800;
    let pausing = false;
    let pauseStart = 0;
    const PAUSE_MS = 1400;

    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const loop = (now: number) => {
      if (isDragging.current) {
        segStart = 0; pauseStart = 0; pausing = false;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (pausing) {
        if (pauseStart === 0) pauseStart = now;
        if (now - pauseStart >= PAUSE_MS) {
          pausing = false; pauseStart = 0;
          stopIndex = (stopIndex + 1) % STOPS.length;
          fromPos = toPos; toPos = STOPS[stopIndex];
          sweepDuration = 1600 + Math.random() * 400;
          segStart = 0;
        }
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (segStart === 0) segStart = now;
      const progress = Math.min((now - segStart) / sweepDuration, 1);
      const pos = Math.round(fromPos + ease(progress) * (toPos - fromPos));
      setSliderPos(pos);
      sliderPosRef.current = pos;
      if (progress >= 1) pausing = true;
      rafRef.current = requestAnimationFrame(loop);
    };

    const t = setTimeout(() => { rafRef.current = requestAnimationFrame(loop); }, 1600);
    return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <section className="hph-section">

      {/* Ambient blobs */}
      <div className="hph-blob-orange" />
      <div className="hph-blob-blue" />

      {/* Main grid */}
      <div className="hph-grid">

        {/* ── Left: Content ── */}
        <div className="hph-content">

          {/* Live badge */}
          <div className="hph-badge">
            <span className="hph-badge-dot-wrap">
              <span className="hph-badge-ping" />
              <span className="hph-badge-dot" />
            </span>
            <span className="hph-badge-text">{s.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="hph-heading">
            {s.h1}<br />
            <span className="hph-heading-accent">{s.accent}</span><br />
            {s.h3}
          </h1>

          {/* Sub */}
          <p className="hph-sub">{s.sub}</p>

          {/* CTAs */}
          <div className="hph-btns">
            {isSignedIn ? (
              <Link href="/dashboard" className="hph-btn-primary">{s.ctaPrimary}</Link>
            ) : (
              <button className="hph-btn-primary" onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}>
                {s.ctaPrimary}
              </button>
            )}
            <Link href="#magic" className="hph-btn-secondary">{s.ctaSecondary}</Link>
          </div>

          {/* Trusted users */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginTop: "0.25rem" }}>
            {/* Avatars */}
            <div style={{ display: "flex" }}>
              {["/avatars/female1.jpg", "/avatars/female3.jpg", "/avatars/av2.jpg", "/avatars/female2.jpg", "/avatars/av5.jpg"].map((src, i) => (
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
            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} fill="var(--brand-color)" stroke="none" />
                ))}
              </div>
              <p style={{ fontSize: "0.78rem", color: "#475569", margin: 0, fontWeight: 500 }}>
                {s.trustedPre}{" "}
                <CountUp value={2500} duration={2} separator="," suffix="+" colorScheme="gradient" className="font-bold" />
                {" "}{s.trustedMid}{" "}
                <a href="/#reviews" style={{ color: "var(--brand-color)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "2px" }}>
                  {s.happyUsers}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Slider ── */}
        <div className="hph-slider-wrap">
          <div className="hph-slider-glow" />

          <div className="hph-slider-container">
            <ReactCompareSlider
              position={sliderPos}
              onPositionChange={(p) => { setSliderPos(p); sliderPosRef.current = p; }}
              onPointerDown={() => { isDragging.current = true; }}
              onPointerUp={() => { isDragging.current = false; }}
              onPointerLeave={() => { isDragging.current = false; }}
              onPointerCancel={() => { isDragging.current = false; }}
              style={{ width: "100%", height: "100%" }}
              handle={
                <ReactCompareSliderHandle
                  buttonStyle={{ display: "none" }}
                  linesStyle={{ background: "rgba(255,255,255,0.2)", width: 1 }}
                />
              }
              itemOne={<ReactCompareSliderImage src={heroBeforeUrl} alt="2D Floor Plan Configuration" style={{ objectFit: "cover" }} />}
              itemTwo={<ReactCompareSliderImage src={heroAfterUrl} alt="AI Generated Floor Plan" style={{ objectFit: "cover" }} />}
            />

            {/* Labels */}
            <span style={{ position:"absolute", top:12, left:12, zIndex:20, padding:"5px 10px", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:"0.55rem", letterSpacing:"0.12em", borderRadius:100, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none", textTransform:"uppercase", whiteSpace:"nowrap" }}>
              Before
            </span>
            <span style={{ position:"absolute", top:12, right:12, zIndex:20, padding:"5px 10px", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:"0.55rem", letterSpacing:"0.12em", borderRadius:100, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none", textTransform:"uppercase", whiteSpace:"nowrap" }}>
              After
            </span>
          </div>

          {/* Floating glass card */}
          <div className="hph-float-card">
            <div className="hph-float-row">
              <div className="hph-float-icon">
                <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="hph-float-label">{s.floatLabel}</span>
            </div>
            <div className="hph-float-bar-bg">
              <div className="hph-float-bar-fill" />
            </div>
            <p className="hph-float-sub">{s.floatSub}</p>
          </div>
        </div>

      </div>

      {/* ── Feature cards ── */}
      <div className="hph-features">
        {features.map((f) => (
          <Link href="/dashboard" key={f.title} className="hph-feat-card">
            <div className="hph-feat-icon">{f.icon}</div>
            <h3 className="hph-feat-title">{f.title}</h3>
            <p className="hph-feat-desc">{f.desc}</p>
          </Link>
        ))}
      </div>

    </section>
  );
}
