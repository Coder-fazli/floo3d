"use client";

import Navbar from "@/components/Navbar";
import { ArrowRight, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Upload from "@/components/Upload";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getProjects } from "@/lib/actions";

export default function Home() {
  const router = useRouter();
  
  const { user } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const isUploading = useRef(false);

  useEffect(() => {
    if (user) {
      getProjects(user.id).then(setProjects);
    }
  }, [user]);
  
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

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing Floo3D 2.0</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Floo3D</h1>

        <p className="subtitle">
          Floo3D is an AI-first design environment that helps you visualize, render, and ship architectural projects faster than ever
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>

        <div className="upload-shell" id="upload">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG, formats up to 10MB</p>
            </div>
            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Your latest work and shared community projects, all in one place</p>
            </div>
          </div>

          <div className="projects-grid">
            {projects.length === 0 ? (
              <div className="empty">No projects yet. Upload a floor plan to get started.</div>
            ) : (
              projects.map(({ _id, name, renderedImageUrl, originalImageUrl, createdAt }) => (
                <div key={_id} className="project-card group" onClick={() => router.push(`/visualizer/${_id}`)}>
                  <div className="preview">
                    <img src={renderedImageUrl || originalImageUrl} alt={name || "Project"} />
                    <div className="badge">
                      <span>My Project</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div>
                      <h3>{name}</h3>
                      <div className="meta">
                        <Clock size={12} />
                        <span>{new Date(createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="arrow">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
