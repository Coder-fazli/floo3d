"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Blog from "@/components/Blog";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import { Marquee } from "@/components/ui/marquee";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getProject } from "@/lib/actions";

const reviews = [
  { name: "Sarah M.", handle: "@sarahm", avatar: "SM", color: "bg-violet-500", text: "I rendered my entire apartment floor plan in under 2 minutes. The 3D output is stunning, clients love it." },
  { name: "James K.", handle: "@jamesk", avatar: "JK", color: "bg-blue-500", text: "As an architect, this saves me hours. The AI understands spatial layout better than I expected." },
  { name: "Lena R.", handle: "@lenar", avatar: "LR", color: "bg-pink-500", text: "Used it for my renovation project. Before and after comparison slider is a killer feature." },
  { name: "Omar T.", handle: "@omart", avatar: "OT", color: "bg-emerald-500", text: "Finally a tool that makes floor plans look like real renders. My agency uses this daily now." },
  { name: "Priya S.", handle: "@priyas", avatar: "PS", color: "bg-amber-500", text: "Super fast, super clean. I shared the link with my client and they approved the design instantly." },
  { name: "Chris L.", handle: "@chrisl", avatar: "CL", color: "bg-rose-500", text: "The quality blew me away. Looks like a proper architectural visualization tool but way simpler." },
  { name: "Mia F.", handle: "@miaf", avatar: "MF", color: "bg-cyan-500", text: "I'm not even a designer and I managed to get a beautiful 3D render from my hand-drawn sketch." },
  { name: "Dev P.", handle: "@devp", avatar: "DP", color: "bg-indigo-500", text: "Best AI tool I've used this year. The export quality is perfect for client presentations." },
];

export default function Home() {
  const router = useRouter();
  
  const { user } = useUser();
  const [demoProject, setDemoProject] = useState<any>(null);
  const isUploading = useRef(false);

  useEffect(() => {
    getProject("69b01aef967226f4752324b2").then(setDemoProject);
  }, []);
  
  const handleUploadComplete = async (base64Image: string) => {
    if (!user || isUploading.current) return;
    isUploading.current = true;
    const name = prompt("Enter a name for your project:");
    if (!name) { isUploading.current = false; return; }
    const res = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, userId: user.id, base64Image }),
    });
    const project = await res.json();
    isUploading.current = false;
    router.push(`/visualizer/${project._id}`);
    };

  return (
    <div className="home">
      <Navbar />

      <Hero
        onUploadComplete={handleUploadComplete}
        demoOriginal={demoProject?.originalImageUrl}
        demoRender={demoProject?.renderedImageUrl}
      />

      <RecentProjects />

      <HowItWorks />

      <section className="marquee-section" id="reviews">
        <div className="marquee-header">
          <span className="marquee-eyebrow">Real Stories</span>
          <h2 className="marquee-title">
            Trusted by <em className="marquee-accent">Thousands</em> of Creators
          </h2>
          <p className="marquee-subtitle">Architects, designers, and visionaries who transformed their workflow.</p>
        </div>
        <Marquee pauseOnHover repeat={3} className="marquee-strip">
          {reviews.slice(0, 4).map((r) => (
            <div key={r.handle} className="review-card">
              <div className="review-header">
                <div className={`review-avatar ${r.color}`}>{r.avatar}</div>
                <div>
                  <p className="review-name">{r.name}</p>
                  <p className="review-handle">{r.handle}</p>
                </div>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover repeat={3} className="marquee-strip">
          {reviews.slice(4).map((r) => (
            <div key={r.handle} className="review-card">
              <div className="review-header">
                <div className={`review-avatar ${r.color}`}>{r.avatar}</div>
                <div>
                  <p className="review-name">{r.name}</p>
                  <p className="review-handle">{r.handle}</p>
                </div>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </Marquee>
      </section>

      <Blog />

      <Footer />
    </div>
  );
}
