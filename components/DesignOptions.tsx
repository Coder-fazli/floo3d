"use client";

import "./DesignOptions.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import AutoCompareSlider from "@/components/AutoCompareSlider";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("do-visible"); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ImgCard({ before, after, badge, beforeLabel, afterLabel }: { before: string; after: string; badge?: string; beforeLabel: string; afterLabel: string }) {
  return (
    <div className="do-img-card">
      <AutoCompareSlider before={before} after={after} />
      <span className="do-label do-label-before">{beforeLabel}</span>
      <span className="do-label do-label-after">{afterLabel}</span>
      {badge && <div className="do-img-badge">{badge}</div>}
    </div>
  );
}

type TransformImages = Record<string, { before?: string; after?: string }>;

export default function DesignOptions({ transformImages = {} }: { transformImages?: TransformImages }) {
  const t = useTranslations("design");
  const refHeader = useFadeIn();
  const ref01 = useFadeIn();
  const ref02 = useFadeIn();
  const ref03 = useFadeIn();

  const img = (section: string, side: "before" | "after", fallback: string) =>
    transformImages[section]?.[side] || fallback;

  return (
    <section className="do-section">

      {/* ── Header ── */}
      <div className="do-header do-fade" ref={refHeader}>
        <div>
          <span className="do-eyebrow">{t("eyebrow")}</span>
          <h2 className="do-heading">
            {t("heading")}<br />
            <span className="do-heading-accent">{t("headingAccent")}</span>
          </h2>
        </div>
        <p className="do-header-desc">{t("headerDesc")}</p>
      </div>

      {/* ── Items ── */}
      <div className="do-items">

        {/* 01 */}
        <div className="do-item do-fade" ref={ref01}>
          <span className="do-ghost-num" style={{ top: "-1.5rem", left: "-0.5rem" }}>01</span>
          <div className="do-grid">
            <div className="do-col-img-left">
              <ImgCard before={img("01","before","/real-2d-plan.jpg")} after={img("01","after","/real-3d-render.jpg")} badge="Rendering Phase: Final Polish" beforeLabel={t("before")} afterLabel={t("after")} />
            </div>
            <div className="do-col-text-right">
              <div className="do-text-card">
                <h3 className="do-item-title">{t("item1Title")}</h3>
                <p className="do-item-desc">{t("item1Desc")}</p>
                <Link href="/dashboard" className="do-cta-btn">{t("tryNow")}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* 02 */}
        <div className="do-item do-fade" ref={ref02}>
          <span className="do-ghost-num" style={{ top: "-1.5rem", right: "-0.5rem" }}>02</span>
          <div className="do-grid">
            <div className="do-col-text-left">
              <div className="do-text-card">
                <h3 className="do-item-title">{t("item2Title")}</h3>
                <p className="do-item-desc">{t("item2Desc")}</p>
                <Link href="/dashboard" className="do-cta-btn">{t("tryNow")}</Link>
              </div>
            </div>
            <div className="do-col-img-right">
              <ImgCard before={img("02","before","/fp-before-1.png")} after={img("02","after","/fp-after-1.jpg")} beforeLabel={t("before")} afterLabel={t("after")} />
            </div>
          </div>
        </div>

        {/* 03 */}
        <div className="do-item do-fade" ref={ref03}>
          <div className="do-flex-row">
            <div className="do-flex-img">
              <ImgCard before={img("03","before","/fp-before-2.png")} after={img("03","after","/fp-after-2.jpg")} beforeLabel={t("before")} afterLabel={t("after")} />
              <div className="do-corner-thumb">
                <img src={img("03","after","/fp-after-2.jpg")} alt="3D render" />
              </div>
            </div>
            <div className="do-flex-text">
              <div className="do-text-card">
                <h3 className="do-item-title">{t("item3Title")}</h3>
                <p className="do-item-desc">{t("item3Desc")}</p>
                <Link href="/dashboard" className="do-cta-btn">{t("tryNow")}</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
