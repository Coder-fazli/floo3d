"use client";

import { motion } from "framer-motion";
import "./HowItWorks2.css";
import { useTranslations } from "next-intl";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const, delay: i * 0.12 },
  }),
};

export default function StatsBar() {
  const t = useTranslations("stats");
  const stats = [
    { num: t("speed"),    title: t("speedTitle"),    desc: t("speedDesc") },
    { num: t("accuracy"), title: t("accuracyTitle"), desc: t("accuracyDesc") },
    { num: t("clicks"),   title: t("clicksTitle"),   desc: t("clicksDesc") },
  ];

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
