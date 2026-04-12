"use client";

import "./new.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import AppSidebar from "@/components/AppSidebar";
import { ArrowLeft } from "lucide-react";

const INPUT_TYPES = [
  {
    id: "floor-plan",
    imgBefore: "/faq-3d.png",
    imgAfter: "/faq-2d.jpg",
    label: "2D Floor Plan to 3D",
    desc: "Transform flat blueprints into immersive 3D architectural renders",
  },
  {
    id: "interior-design",
    imgBefore: "/card-room-after.webp",
    imgAfter: "/card-room-before.webp",
    label: "Interior Design",
    desc: "Redesign any room with a new style using AI",
  },
  {
    id: "outdoor",
    imgBefore: "/card-outdoor-before.avif",
    imgAfter: "/card-outdoor-after.avif",
    label: "Outdoor / Garden",
    desc: "Reimagine your exterior spaces and garden layouts",
  },
  {
    id: "empty-room",
    imgBefore: "/card-empty-after.webp",
    imgAfter: "/card-empty-before.webp",
    label: "Empty the Room",
    desc: "Clear furniture instantly to plan a fresh new layout",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) router.push("/");
  }, [isLoaded, user]);

  if (!isLoaded || !user) return null;

  return (
    <div className="np-page">
      <AppSidebar />
      <main className="np-main">
        <div className="np-header">
          <button className="np-back" onClick={() => router.push("/dashboard")}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="np-title">Choose a transformation</h1>
          <p className="np-sub">Select the type of render you want to create</p>
        </div>

        <div className="np-grid">
          {INPUT_TYPES.map((t) => (
            <div
              key={t.id}
              className="np-card"
              onClick={() => router.push(`/visualizer/new?type=${t.id}`)}
            >
              <div className="np-card-images">
                <div
                  className="np-img np-img-before"
                  style={{ backgroundImage: `url(${t.imgBefore})` }}
                />
                <div
                  className="np-img np-img-after"
                  style={{ backgroundImage: `url(${t.imgAfter})` }}
                />
                <div className="np-img-badge">Before / After</div>
              </div>
              <div className="np-card-body">
                <h3 className="np-card-label">{t.label}</h3>
                <p className="np-card-desc">{t.desc}</p>
              </div>
              <div className="np-card-arrow">→</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
