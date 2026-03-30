export const DEFAULT_FALLBACKS: Record<string, { before: string; after: string; labelBefore: string; labelAfter: string }> = {
  "floor-plan":      { before: "/real-2d-plan.jpg",         after: "/real-3d-render.jpg",      labelBefore: "Original 2D Plan",  labelAfter: "AI 3D Render" },
  "interior-design": { before: "/card-room-before.webp",    after: "/card-room-after.webp",    labelBefore: "Original Room",     labelAfter: "AI Redesigned" },
  "outdoor":         { before: "/card-outdoor-before.webp", after: "/card-outdoor-after.webp", labelBefore: "Original Outdoor",  labelAfter: "AI Outdoor Design" },
  "empty-room":      { before: "/card-empty-before.webp",   after: "/card-empty-after.webp",   labelBefore: "Furnished Room",    labelAfter: "Emptied Room" },
};

// Keyed by inputType → styleName → default image path
export const DEFAULT_STYLES: Record<string, Record<string, string>> = {
  "floor-plan": {
    "Modern":       "/card-room-after.webp",
    "Scandinavian": "/style-scandinavian.jpg",
    "Industrial":   "/style-industrial.jpg",
    "Rustic":       "/style-rustic.webp",
    "Luxury":       "/style-luxury.jpg",
    "Minimalist":   "/style-minimalist.jpg",
  },
  "interior-design": {
    "Modern":       "/card-room-after.webp",
    "Scandinavian": "/style-scandinavian.jpg",
    "Industrial":   "/style-industrial.jpg",
    "Rustic":       "/style-rustic.webp",
    "Luxury":       "/style-luxury.jpg",
    "Minimalist":   "/style-minimalist.jpg",
  },
  "outdoor": {
    "Mediterranean": "/card-outdoor-after.webp",
    "Japanese":      "/card-outdoor-after.webp",
    "Tropical":      "/card-outdoor-before.webp",
    "Cottage":       "/card-outdoor-before.webp",
    "Modern":        "/thumb2.jpg",
    "Desert":        "/thumb2.jpg",
  },
  "empty-room": {
    "Clean": "/card-empty-before.webp",
  },
};

export const INPUT_TYPE_LABELS: Record<string, string> = {
  "floor-plan":      "Floor Plan",
  "interior-design": "Interior Design",
  "outdoor":         "Outdoor",
  "empty-room":      "Empty Room",
};
