"use client";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProject } from "@/lib/actions";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import SocialButton from "@/components/kokonutui/social-button";

export default function VisualizerClient() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useUser();

  const hasInitialGenerated = useRef(false);
  const [project, setProject] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleBack = () => router.push("/dashboard");

  // Handle Share Button
  const handleShare = async () => {
    if (!currentImage) return;
    const url = `${window.location.origin}/visualizer/${id}`;
    await navigator.clipboard.writeText(url);
    alert("Link copied");
  };

  // Export functionality
  const handleExport = async () => {
    if (!currentImage) return;
    const response = await fetch(currentImage);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project?.name || "floo3d-render"}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (id) {
      getProject(id as string).then(setProject);
    }
  }, [id]);

  // Running generation on initial load if not already generated
  const runGeneration = async () => {
    if (!project) return;
    try {
      setIsProcessing(true);
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          projectId: project._id,
          imageUrl: project.originalImageUrl,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      setCurrentImage(data.renderedImageUrl);
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!project || hasInitialGenerated.current) return;
    hasInitialGenerated.current = true;
    if (project.renderedImageUrl) {
      setCurrentImage(project.renderedImageUrl);
    } else if (user) {
      runGeneration();
    }
  }, [project]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Floo3D</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{project?.name || "Untitled project"}</h2>
              <p className="note">Created by You</p>
            </div>

            <div className="panel-actions">
              <Button size="sm" onClick={handleExport} className="export" disabled={!currentImage}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              {/* <Button size="sm" onClick={handleShare} className="share" disabled={!currentImage}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button> */}
               <SocialButton shareUrl={typeof window !== "undefined" ? `${window.location.origin}/visualizer/${id}` : ""} />
            </div>
          </div>

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img
                src={currentImage}
                alt="AI Render"
                className="render-img"
                style={{ cursor: "zoom-in" }}
                onClick={() => setLightboxOpen(true)}
              />
            ) : (
              <div className="render-placeholder">
                {project?.originalImageUrl && (
                  <img src={project.originalImageUrl} alt="Original" className="render-fallback" />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Generating...</span>
                  <span className="subtitle">Generating your 3D visualization...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Before and After</h3>
            </div>
            <div className="hint">Drag to Compare</div>
          </div>

          <div className="compare-stage">
            {project?.originalImageUrl && currentImage ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ width: "100%", height: "auto" }}
                itemOne={
                  <ReactCompareSliderImage src={project.originalImageUrl} className="compare-img" alt="before" />
                }
                itemTwo={
                  <ReactCompareSliderImage src={currentImage || project?.originalImageUrl} className="compare-img" alt="Original" />
                }
              />
            ) : (
              <div className="compare-fallback">
                {project?.originalImageUrl && (
                  <img src={project?.originalImageUrl} alt="Before" className="compare-img" />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {currentImage && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: currentImage }]}
        />
      )}
    </div>
  );
}
