"use client";

import "./Footer.css";
import { Box, ArrowRight, Globe } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

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
            <p className="ftr-brand-desc">
              AI-powered space visualization for architects, designers, and real estate professionals. Floor plans, room redesigns, empty interiors, outdoor renders — all in one platform.
            </p>
            <div className="ftr-badges">
              <span className="ftr-badge-pill">Built with Passion</span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="ftr-newsletter">
            <div className="ftr-newsletter-card">
              <h3 className="ftr-newsletter-title">Stay ahead of the curve</h3>
              <p className="ftr-newsletter-sub">Get weekly tips on AI interior design, free AI landscape design tools, and new features.</p>
              <form className="ftr-form" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="ftr-input"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="ftr-subscribe-btn" type="submit">
                  Subscribe
                  <ArrowRight size={16} className="ftr-subscribe-icon" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Nav links */}
        <div className="ftr-nav">
          <div className="ftr-nav-col">
            <h4 className="ftr-nav-heading">Product</h4>
            <ul className="ftr-nav-list">
              <li><a href="#" className="ftr-nav-link">Features</a></li>
              <li><a href="#" className="ftr-nav-link">Solutions</a></li>
              <li><a href="#" className="ftr-nav-link">Pricing</a></li>
              <li><a href="#" className="ftr-nav-link">Enterprise</a></li>
            </ul>
          </div>
          <div className="ftr-nav-col">
            <h4 className="ftr-nav-heading">Company</h4>
            <ul className="ftr-nav-list">
              <li><a href="#" className="ftr-nav-link">About Us</a></li>
              <li><a href="#" className="ftr-nav-link">Careers</a></li>
              <li><a href="#" className="ftr-nav-link">Press</a></li>
              <li><a href="#" className="ftr-nav-link">Contact</a></li>
            </ul>
          </div>
          <div className="ftr-nav-col">
            <h4 className="ftr-nav-heading">Resources</h4>
            <ul className="ftr-nav-list">
              <li><a href="#" className="ftr-nav-link">Documentation</a></li>
              <li><a href="#" className="ftr-nav-link">Blog</a></li>
              <li><a href="#" className="ftr-nav-link">Tutorials</a></li>
              <li><a href="#" className="ftr-nav-link">Community</a></li>
            </ul>
          </div>
          <div className="ftr-nav-col">
            <h4 className="ftr-nav-heading">Legal</h4>
            <ul className="ftr-nav-list">
              <li><a href="#" className="ftr-nav-link">Privacy Policy</a></li>
              <li><a href="#" className="ftr-nav-link">Terms of Service</a></li>
              <li><a href="#" className="ftr-nav-link">Cookie Policy</a></li>
              <li><a href="#" className="ftr-nav-link">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ftr-bottom">
          <p className="ftr-copy">© 2026 MyHomeStyler Systems Inc. All rights reserved.</p>


          {/* Right meta */}
          <div className="ftr-meta">
            <button className="ftr-meta-btn">
              <Globe size={16} />
              English (US)
            </button>
            <div className="ftr-divider" />
            <button className="ftr-meta-btn">
              Status: Operational
              <span className="ftr-status-dot" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
