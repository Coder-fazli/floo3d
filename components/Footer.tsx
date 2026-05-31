"use client";

import "./Footer.css";
import { Box, ArrowRight, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const [email, setEmail] = useState("");
  const t = useTranslations("footer");

  return (
    <footer className="ftr-footer">
      {/* Top gradient line */}
      <div className="ftr-top-line" />

      <div className="ftr-inner">

        {/* Brand + Newsletter */}
        <div className="ftr-top">

          {/* Brand */}
          <div className="ftr-brand">
            <div className="ftr-logo-row">
              <div className="ftr-logo-icon">
                <Box size={20} color="#fff" />
              </div>
              <span className="ftr-logo-name">MyHomeStyler</span>
            </div>
            <p className="ftr-brand-desc">{t("brandDesc")}</p>
            <div className="ftr-badges">
              <span className="ftr-badge-pill">{t("builtWith")}</span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="ftr-newsletter">
            <div className="ftr-newsletter-card">
              <h3 className="ftr-newsletter-title">{t("newsletterTitle")}</h3>
              <p className="ftr-newsletter-sub">{t("newsletterSub")}</p>
              <form className="ftr-form" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="ftr-input"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="ftr-subscribe-btn" type="submit">
                  {t("subscribe")}
                  <ArrowRight size={16} className="ftr-subscribe-icon" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Nav links */}
        <div className="ftr-nav">
          <div className="ftr-nav-col">
            <h4 className="ftr-nav-heading">{t("productHeading")}</h4>
            <ul className="ftr-nav-list">
              <li><a href="#" className="ftr-nav-link">{t("features")}</a></li>
              <li><a href="#" className="ftr-nav-link">{t("solutions")}</a></li>
              <li><a href="/pricing" className="ftr-nav-link">{t("pricing")}</a></li>
              <li><a href="#" className="ftr-nav-link">{t("enterprise")}</a></li>
            </ul>
          </div>
          <div className="ftr-nav-col">
            <h4 className="ftr-nav-heading">{t("companyHeading")}</h4>
            <ul className="ftr-nav-list">
              <li><a href="/contact" className="ftr-nav-link">{t("contactUs")}</a></li>
            </ul>
          </div>
          <div className="ftr-nav-col">
            <h4 className="ftr-nav-heading">{t("toolsHeading")}</h4>
            <ul className="ftr-nav-list">
              <li><a href="/2d-to-3d-floor-plan-converter" className="ftr-nav-link">{t("converter")}</a></li>
              <li><a href="/floor-plan-generator" className="ftr-nav-link">{t("floorPlan")}</a></li>
              <li><a href="/pricing" className="ftr-nav-link">{t("pricing")}</a></li>
            </ul>
          </div>
          <div className="ftr-nav-col">
            <h4 className="ftr-nav-heading">{t("legalHeading")}</h4>
            <ul className="ftr-nav-list">
              <li><a href="/privacy-policy" className="ftr-nav-link">{t("privacyPolicy")}</a></li>
              <li><a href="/terms-of-service" className="ftr-nav-link">{t("termsOfService")}</a></li>
              <li><a href="/refund-policy" className="ftr-nav-link">{t("refundPolicy")}</a></li>
              <li><a href="/contact" className="ftr-nav-link">{t("contact")}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ftr-bottom">
          <p className="ftr-copy">{t("copyright")}</p>

          {/* Right meta */}
          <div className="ftr-meta">
            <button className="ftr-meta-btn">
              <Globe size={16} />
              {t("language")}
            </button>
            <div className="ftr-divider" />
            <button className="ftr-meta-btn">
              {t("status")}
              <span className="ftr-status-dot" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
