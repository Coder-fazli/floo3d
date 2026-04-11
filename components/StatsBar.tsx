"use client";

import { motion } from "framer-motion";
import "./HowItWorks2.css";

const stats = [
  { num: "< 60s",   title: "Blazing Fast",  desc: "From upload to finished visual in less than a minute. Save hours of manual design work." },
  { num: "99.9%",   title: "High Accuracy", desc: "Proprietary AI captures every dimension with precision. Expect professional-grade results every time." },
  { num: "1-Click", title: "Zero Effort",   desc: "No complex software to learn. If you can upload a file, you can create a 3D masterpiece." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const, delay: i * 0.12 },
  }),
};

export default function StatsBar() {
  return (
    <div className="hiw2-stats">
      <div className="hiw2-stats-grid">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className="hiw2-stat-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={i + 1}
          >
            <p className="hiw2-stat-num">{s.num}</p>
            <h4 className="hiw2-stat-title">{s.title}</h4>
            <p className="hiw2-stat-desc">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
