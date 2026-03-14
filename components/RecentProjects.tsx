"use client";

import "./RecentProjects.css";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const, delay: i * 0.15 },
  }),
};

const BADGE_ICONS: Record<string, string> = {
  "Real Result": "auto_awesome",
  "Epic Result": "verified",
  "Trending Now": "trending_up",
};

const PROJECTS = [
  {
    id: 1,
    user: "Emma Wilson",
    role: "Pro Architect",
    avatar: "/avatars/female1.jpg",
    avatarInitials: null,
    resultImage: "/result1.png",
    thumbImage: "/thumb1.webp",
    peekIcon: "description",
    peekLabel: "Peek at Plan",
    peekArrow: false,
    title: "London Loft Conversion",
    badge: "Real Result",
    likes: "1,204",
    caption: "This transformation is insane! From a dusty warehouse plan to a premium high-end loft.",
    tags: "#Floo3DMagic #InteriorDesign",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Sarah Chen",
    role: "Rising Creator",
    avatar: "/avatars/female2.jpg",
    avatarInitials: null,
    resultImage: "/result2.png",
    thumbImage: "/thumb2.jpg",
    peekIcon: "map",
    peekLabel: "View Source Plan",
    peekArrow: true,
    title: "Coastal Villa Masterpiece",
    badge: "Epic Result",
    likes: "892",
    caption: "Uploaded my hand-drawn sketch and got a photorealistic 3D render in seconds. Mind blown.",
    tags: "#CoastalDesign #Floo3D",
    time: "4 hours ago",
  },
  {
    id: 3,
    user: "Amara Okafor",
    role: "Real Estate Visionary",
    avatar: "/avatars/female3.jpg",
    avatarInitials: null,
    resultImage: "/result3.png",
    thumbImage: "/thumb3.webp",
    peekIcon: "architecture",
    peekLabel: "Blueprint Snapshot",
    peekArrow: false,
    title: "Skyline Office Lounge",
    badge: "Trending Now",
    likes: "2,451",
    caption: "Our entire sales team now uses Floo3D to pitch properties. Conversion rate is through the roof.",
    tags: "#RealEstate #3DRender",
    time: "1 day ago",
  },
];

export default function RecentProjects() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      <section className="rp-section" id="gallery">
        <div className="rp-inner">
          <motion.div
            className="rp-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0}
          >
            <p className="rp-label">Community Showcase</p>
            <h2 className="rp-title">Real Results from Real Users</h2>
            <p className="rp-sub">See how architects and designers are transforming floor plans with Floo3D</p>
          </motion.div>

          <div className="rp-grid">
            {PROJECTS.map((p, i) => (
              <motion.div
                key={p.id}
                className="rp-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={fadeUp}
                custom={i + 1}
              >

                {/* User header */}
                <div className="rp-card-head">
                  <div className="rp-user">
                    <div className="rp-avatar-wrap">
                      {p.avatar ? (
                        <Image src={p.avatar} alt={p.user} className="rp-avatar" width={36} height={36} />
                      ) : (
                        <div className="rp-avatar-initials">{p.avatarInitials}</div>
                      )}
                    </div>
                    <div>
                      <p className="rp-user-name">{p.user}</p>
                      <p className="rp-user-role">{p.role}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined rp-more">more_horiz</span>
                </div>

                {/* Image */}
                <div className="rp-img-wrap">
                  <Image src={p.resultImage} alt={p.title} className="rp-img" width={340} height={340} />

                  {/* Badge */}
                  <div className="rp-badge">
                    <span className="material-symbols-outlined rp-badge-icon">{BADGE_ICONS[p.badge]}</span>
                    {p.badge}
                  </div>

                  {/* Plan peek */}
                  <div className="rp-peek">
                    <div className="rp-peek-card">
                      <div className="rp-peek-thumb-wrap">
                        <Image src={p.thumbImage} alt="plan" className="rp-peek-thumb" width={56} height={56} />
                        <div className="rp-peek-icon-wrap">
                          <span className="material-symbols-outlined rp-peek-icon">{p.peekIcon}</span>
                        </div>
                      </div>
                      <div className="rp-peek-info">
                        <p className="rp-peek-label">{p.peekLabel}</p>
                        <p className="rp-peek-title">{p.title}</p>
                      </div>
                      {p.peekArrow && (
                        <span className="material-symbols-outlined rp-peek-arrow">arrow_forward_ios</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="rp-card-footer">
                  <div className="rp-actions">
                    <span className="material-symbols-outlined rp-icon rp-icon-like">favorite</span>
                    <span className="material-symbols-outlined rp-icon">chat_bubble</span>
                    <span className="material-symbols-outlined rp-icon">send</span>
                    <span className="material-symbols-outlined rp-icon rp-icon-right">bookmark</span>
                  </div>
                  <p className="rp-likes">{p.likes} Likes</p>
                  <p className="rp-caption">
                    <span className="rp-caption-user">{p.user.toLowerCase().replace(" ", "_")}</span>{" "}
                    {p.caption} <span className="rp-tags">{p.tags}</span>
                  </p>
                  <p className="rp-time">{p.time}</p>
                </div>

              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
