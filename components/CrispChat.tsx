"use client";
import { useEffect } from "react";

export default function CrispChat() {
  useEffect(() => {
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = "2f2b0c10-4edc-42b7-a91e-d3d3aca34e1c";
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);
  return null;
}
