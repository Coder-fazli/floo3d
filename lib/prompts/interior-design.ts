import { StyleDef } from "./types";

const interiorStyles: Record<string, StyleDef> = {
  Modern: {
    rules: `
- FURNITURE: Replace or adapt ornate and heavy pieces so they appear as clean straight-lined furniture — no curves, no carvings, no patterns. Keep the furniture count low.
- SURFACES: Replace or smooth rough and textured surfaces so floors and walls feel refined and flat.
- CLUTTER: Remove the least important decorative objects first. Keep only 1–2 functional items visible on surfaces while keeping the room believable.
- LIGHTING: Replace or adapt existing fixtures so they appear as simple geometric or recessed lights.
- COLOUR: Shift the overall palette toward neutrals — whites, greys, warm beige. Avoid bold colours.`,
    feel: "Open, clean and effortlessly refined. Not cold — just intentional.",
  },

  Scandinavian: {
    rules: `
- FURNITURE: Replace or adapt heavy ornate pieces so they appear as simple functional ones — light wood legs, soft fabric upholstery. Keep only what is needed.
- TEXTILES: Add warmth by introducing layered soft textiles — a simple rug, linen cushions, a throw blanket. These are essential to this style.
- LIGHTING: Replace or adapt lighting fixtures so they appear as warm-toned pendants or simple floor lamps that create a cosy glow.
- NATURE: Introduce 1–2 small potted plants or a simple branch in a vase.
- COLOUR: Shift palette toward soft whites, muted greys, warm wood tones and dusty pastels.`,
    feel: "Warm, lived-in and quietly joyful — hygge. Cosy but uncluttered.",
  },

  Industrial: {
    rules: `
- FURNITURE: Replace or adapt furniture so it appears raw and sturdy — metal frames, leather or canvas upholstery, reclaimed wood surfaces. Form follows function.
- SURFACES: Treat imperfection as an asset. If walls show texture, peeling paint or raw material — preserve and enhance it. Do not smooth it over.
- LIGHTING: Replace or adapt fixtures so they appear as bare Edison bulbs, metal cage pendants or exposed cable fixtures.
- OBJECTS: Remove the least important soft or decorative items first. Introduce raw functional objects — metal shelving, industrial hardware — while keeping the room believable.
- COLOUR: Shift palette toward dark and raw — charcoal, black, rust, aged metal, raw wood.`,
    feel: "Honest, raw and urban — like a professionally converted warehouse or workshop.",
  },

  Rustic: {
    rules: `
- FURNITURE: Replace or adapt pieces so they appear as solid natural wood — farmhouse-style, chunky, nothing factory-modern. Upholstery may include linen or cotton in neutral earthy tones.
- SURFACES: Age and warm up surfaces. Replace or adapt floors so they appear worn and natural. Walls may feel plastered, whitewashed or stone-textured.
- TEXTILES: Introduce cosy natural fabrics — a woven rug, cotton throw, linen curtains in cream or terracotta.
- LIGHTING: Replace or adapt fixtures so they appear as wrought-iron candle-style pendants, lanterns or ceramic lamp bases.
- OBJECTS: Introduce 1–3 handmade-feeling objects — ceramic bowls, dried botanicals, wooden vessels.`,
    feel: "Warm, imperfect, grounded and deeply human — as if the room has always been this way.",
  },

  Luxury: {
    rules: `
- FURNITURE: Elevate or replace existing pieces so they appear plush, upholstered or sculptural. Furniture may feel velvet, leather or high-end fabric. Surfaces may include marble, rich wood or polished stone.
- SURFACES: Elevate floors and walls. Replace or adapt floors so they feel like marble, parquet or rich hardwood. Walls may include panelling, textured wallpaper or a deep rich colour.
- LIGHTING: Replace or adapt fixtures so they appear as statement pieces — a chandelier, sculptural pendant or dramatic wall sconces.
- DETAILS: Introduce gold, brass or chrome accents in frames, handles, furniture legs and trims.
- OBJECTS: Add fresh flowers, framed art, decorative objects in marble or crystal, layered velvet cushions.`,
    feel: "A 5-star hotel suite — curated, rich, indulgent and deeply impressive.",
  },

  Minimalist: {
    rules: `
- FURNITURE: Reduce furniture to the minimum required for the room's function. Keep only 1–2 essential pieces. Remove the least important items first while keeping the room believable and functional.
- OBJECTS: Strongly reduce decorative objects. Remove the least important items first. Surfaces should be largely bare — a single object at most per surface.
- SURFACES: Clean and simplify every surface. Walls should be calm and unadorned. Floors should appear clear and seamless.
- LIGHTING: Replace or adapt lighting so it appears as one clean overhead light source. Reduce secondary lamps where possible.
- COLOUR: Reduce the palette to white, off-white and one neutral tone. Avoid patterns.`,
    feel: "A deliberate act of removal — calm, silent and completely at peace.",
  },
};

export function buildInteriorDesignPrompt(style: string, roomType?: string): string {
  const s = interiorStyles[style] ?? {
    rules: `- Replace or adapt the room's furniture, surfaces, lighting and decor so they match ${style} design principles.`,
    feel: `A professionally redesigned ${style} interior.`,
  };

  return `
USE THE PROVIDED PHOTO AS THE EXACT STRUCTURAL BASE.

GLOBAL RULES — DO NOT VIOLATE UNDER ANY CIRCUMSTANCES:
1) Keep the exact same camera angle and perspective — do not rotate, zoom or shift the viewpoint.
2) Keep all walls, doors, windows, openings and architectural features in their exact position and proportion.
3) Do not change the size or shape of the room.
4) Keep all fixed built-in elements exactly in place — bathtub, toilet, shower, kitchen units, staircases, built-in wardrobes.
5) Treat any damaged, worn or heavily decorated surfaces as renovation targets — work with them, do not invent new architecture.
6) No text, labels or watermarks in the output.
7) Preserve the spatial layout of the room — large furniture should remain in roughly the same position unless the style clearly requires a minor adjustment.
8) When reducing objects or furniture, remove the least important items first while keeping the room believable and functional.

ROOM TYPE: ${roomType ?? "identify from the photo"}
Apply all style rules specifically for a ${roomType ?? "the room type visible in the photo"}. Keep fixtures and furniture appropriate to this room.

STYLE APPLICATION — ${style.toUpperCase()}:
Apply the style strongly but realistically, as if the room was professionally redesigned by an interior designer while keeping its original architecture intact.
Only modify: movable furniture, floor surface, wall finish, lighting fixtures and decorative objects.
${s.rules}

STYLE FEEL:
${s.feel}

FINISH: The result should look like a professionally photographed interior renovation of the same room. Lighting direction, window light and time-of-day must remain consistent with the input photo. No watermarks.
`.trim();
}
