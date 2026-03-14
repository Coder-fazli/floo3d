"use client";

import "./Blog.css";
import { ArrowUpRight } from "lucide-react";
import { useEffect } from "react";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".blg-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Blog() {
  useScrollReveal();

  return (
    <section className="blg-section" id="journal">
      {/* Background orbs */}
      <div className="blg-orb blg-orb-tr" />
      <div className="blg-orb blg-orb-bl" />

      <div className="blg-inner">

        {/* Header */}
        <div className="blg-header blg-reveal">
          <span className="blg-eyebrow">The Journal</span>
          <h2 className="blg-ghost-title" aria-hidden="true">INSIGHTS</h2>
          <div className="blg-heading-wrap">
            <h3 className="blg-title">
              Design <em className="blg-accent">Manifesto</em>
            </h3>
            <p className="blg-subtitle">
              Exploring the collision of technology, nature, and human-centric spaces.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="blg-grid">

          {/* Article 01 — Featured large */}
          <article className="blg-article blg-article-featured blg-reveal">
            <div className="blg-img-wrap blg-img-featured">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvz4SRFqEepWYNFojFcyOK3SjNcyImGdsxiGEsBt79yjQ2agl7OcDjdHySiamrGCAOOV1PdlF5pGbRBDvD2-_T1FRGlndXwlmY9V1x0YLZSyqowOrfzLHOL5EL9NzERzXHhAWtiuq00ysMeQ_BeI6pGd758gfdaEv7cYkohvCM5yIDN_qtxiSr1LoGVOlOXZ9uIuHL6m3ZEICGUAfjiwwGiPtmA2U4ZcUljDoB0Awk1TmOx9zWRuRta6suCipHm1O9k_fyevtTAMLk"
                alt="Sustainable modern building"
                className="blg-img"
              />
              <div className="blg-img-overlay" />
            </div>
            <div className="blg-featured-card">
              <div className="blg-meta">
                <span className="blg-tag">Architecture</span>
                <span className="blg-date">March 2024</span>
              </div>
              <h4 className="blg-card-title">
                The Future of Sustainable Architecture in 2024
              </h4>
              <p className="blg-card-desc">
                Explore how green building materials and biophilic design principles are reshaping the urban skyline and our relationship with nature.
              </p>
              <a href="https://www.archdaily.com/tag/sustainable-architecture" target="_blank" rel="noopener noreferrer" className="blg-read-link">
                READ FULL STORY
                <span className="blg-read-line" />
              </a>
            </div>
          </article>

          {/* Article 02 — Secondary offset */}
          <article className="blg-article blg-article-secondary blg-reveal" style={{ transitionDelay: "100ms" }}>
            <div className="blg-img-wrap blg-img-secondary">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp7IgQ2Bt2JI9f4YeC-uls2npUo3wBT1-KZ8bBPRO5pTVzdtPHDvxMWdnHJ_xC2oKshybW0oUoWvMjuf9gtsXaeYalbuiO3qFOiRoS8xRln_fMxhFIGlet3gjkkdy0imxol4YWkM74kVDi6zPZauizt9Hfk7tWFik_km9WQfBRs7I1BgFxLcj8kJ4PqOE-DAa3EVvVhSQzLuc6BlnLIGGzQK-bybsA7fS_esJthDIBCU0zJvfvXcvloWLyMaBi_2ERUC1K_G6Tt0Q0"
                alt="Luxury interior design"
                className="blg-img blg-img-grayscale"
              />
            </div>
            <div className="blg-secondary-body">
              <span className="blg-eyebrow">Interior Design</span>
              <h4 className="blg-card-title blg-card-title-sm">
                Minimalist Harmony: Balancing Space and Function
              </h4>
              <p className="blg-card-desc blg-card-desc-sm">
                A deep dive into the minimalist movement and how to create living spaces that feel both expansive and incredibly cozy.
              </p>
              <a href="https://www.dezeen.com/tag/minimalism/" target="_blank" rel="noopener noreferrer" className="blg-view-link">VIEW GALLERY</a>
            </div>
          </article>

          {/* Article 03 — Full width */}
          <article className="blg-article blg-article-full blg-reveal" style={{ transitionDelay: "150ms" }}>
            <div className="blg-full-img-wrap">
              <div className="blg-img-tall">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY6kOp2VzDO3F5-M-_pj5-MiwVX2ZhGbBIDG6-otpoOFNXjDaovPu48Ny1To80LtW33WlZEZyUWQxOkg_DeRpYVco6lpgRcOif2Gyy8AN4RorKpvkwpP95TIprleARLjT_-1jgZE6eikRhCBz0trsvOgtGmoXWsNQMUSCmK4rIzZL6RCTXFhJwxSWX5aj3YtFEGLqbODoFtDkStXPd4NsLcCe6zhoHzEskozwSKHf9sJo77oXr0h3DC51L9hwq1d8LhVjLY6dbmPgS"
                  alt="3D Visualization process"
                  className="blg-img"
                />
              </div>
              <div className="blg-float-card">
                <div className="blg-avatars">
                  <div className="blg-avatar blg-av1" />
                  <div className="blg-avatar blg-av2" />
                  <div className="blg-avatar blg-av-count">+12</div>
                </div>
                <p className="blg-float-label">Artists reading this now</p>
              </div>
            </div>
            <div className="blg-full-text">
              <h2 className="blg-big-num">03</h2>
              <span className="blg-dark-tag">3D Visualization</span>
              <h4 className="blg-card-title blg-card-title-xl">
                Mastering Photorealistic <span className="blg-accent">Renders</span> with Octane
              </h4>
              <p className="blg-card-desc">
                Learn the top five lighting tricks our artists use to make digital renders indistinguishable from high-end architectural photography.
              </p>
              <a href="https://www.youtube.com/results?search_query=photorealistic+architectural+render+tutorial" target="_blank" rel="noopener noreferrer" className="blg-cta-btn">START LEARNING</a>
            </div>
          </article>

        </div>

        {/* Footer CTA */}
        <div className="blg-footer blg-reveal">
          <div className="blg-footer-btn-wrap">
            <div className="blg-footer-glow" />
            <a href="https://www.archdaily.com" target="_blank" rel="noopener noreferrer" className="blg-footer-btn">
              <span>Explore the Archive</span>
              <ArrowUpRight size={20} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
