"use client";

import Image from "next/image";

const images = [
  { src: "/styles/industrial/339cc824b1a881d15d145015fd5d9d7e.jpg", style: "Industrial" },
  { src: "/styles/luxury/0edfd36994818abbfa170d231f108677.jpg", style: "Luxury" },
  { src: "/styles/minimalist/14c59b88d6d56f3cb45cc346f8d1065c.jpg", style: "Minimalist" },
  { src: "/styles/industrial/42a0693bca93a79192333ed47473d350.jpg", style: "Industrial" },
  { src: "/styles/luxury/9069aef9e3444ab43916d4d1acd4ee13.jpg", style: "Luxury" },
  { src: "/styles/minimalist/5cefdcc91b1a6b51fd9b79f45eaf1db5.jpg", style: "Minimalist" },
  { src: "/styles/industrial/49c1c6d55014c7de8aee698446738313.jpg", style: "Industrial" },
  { src: "/styles/luxury/92d44fe6bbff791af2c8d174774af6bb.jpg", style: "Luxury" },
  { src: "/styles/minimalist/dc49a159ef8d5f1040ebe5a6ae523052.jpg", style: "Minimalist" },
];

const rotations = ["-2deg", "3deg", "-1deg", "4deg", "-3deg", "2deg", "-2deg", "3deg", "-1deg"];

const allImages = [...images, ...images];

export default function HeroMarquee() {
  return (
    <div
      className="relative w-full overflow-hidden py-12 bg-white"
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 40s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="marquee-track flex gap-8 w-max">
        {allImages.map((img, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 rounded-2xl overflow-hidden shadow-xl"
            style={{
              width: "280px",
              height: "380px",
              transform: `rotate(${rotations[i % rotations.length]})`,
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            <Image
              src={img.src}
              alt={img.style}
              fill
              sizes="280px"
              className="object-cover"
            />
            <div
              className="absolute bottom-4 left-4"
              style={{
                background: "var(--brand-color)",
                borderRadius: "9999px",
                padding: "7px 18px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#ffffff", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1, fontFamily: "var(--font-sans), Inter, sans-serif" }}>
                {img.style}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
