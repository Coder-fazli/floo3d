import { StyleDef } from "./types";

const interiorStyles: Record<string, StyleDef> = {
  Modern: {
    rules: `
- FURNITURE: Replace or adapt all ornate, carved or patterned pieces so they appear as clean straight-lined furniture — flat surfaces, no curves, no decorative legs, no visible patterns. Maximum 3 furniture pieces in the frame. No extra chairs unless the room is clearly a dining room.
- SURFACES: Adapt the existing floor — do not replace it with a completely different material. If the floor is wood, keep it wood but make it appear cleaner and lighter. If the floor is tile, keep it tile but make it appear more uniform. Walls must be flat, matte and one solid neutral colour — no wallpaper, no texture, no panelling.
- CLUTTER: Remove all decorative objects entirely. No plants, no vases, no rugs with patterns, no wall art unless it is a single frameless panel. Maximum 1 object per surface, only if it is functional.
- LIGHTING: Replace or adapt fixtures so they appear as recessed ceiling spots or a single flat geometric pendant. No visible bulbs, no ornate shades.
- COLOUR: Palette must be white, off-white, cool grey or warm greige only. No warm wood tones, no earth tones, no colour accents. Curtains must be plain and flat — no draping, no patterns.
- FORBIDDEN: No plants. No organic textures. No linen or woven fabrics. No visible decorative items. Nothing that could be mistaken for Scandinavian or Rustic.`,
    feel: "Precise, flat and intentional — a room that has been edited down, not decorated up.",
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
- FURNITURE: Keep only the single most essential piece of furniture for the room's function — one sofa, or one bed, or one table. Remove everything else. No side tables, no extra chairs, no shelving unless built-in.
- OBJECTS: Zero decorative objects. No plants, no vases, no candles, no art, no cushions with patterns, no rugs. Surfaces must be completely bare.
- SURFACES: Adapt the existing floor — do not replace it with a completely different material. Make it appear as clean and seamless as possible. Walls must be a single flat white or off-white — no texture, no panelling, no variation.
- LIGHTING: One light source only — a recessed ceiling light or a single flush ceiling fixture. Remove all lamps, sconces and secondary fixtures.
- COLOUR: White and off-white only. One accent neutral (light grey or pale beige) is permitted for a single upholstered surface. Nothing else. No warm tones, no wood, no patterns of any kind.
- FORBIDDEN: No plants. No rugs. No cushions. No decorative objects of any kind. No curtain patterns. Curtains if present must be plain white or off-white and flat against the wall.`,
    feel: "Radical emptiness — every object that remains had to earn its place. The room breathes because almost nothing is in it.",
  },
};

export function buildInteriorDesignPrompt(style: string, roomType?: string): string {
  const s = interiorStyles[style] ?? {
    rules: `- Replace or adapt the room's furniture, surfaces, lighting and decor so they match ${style} design principles.`,
    feel: `A professionally redesigned ${style} interior.`,
  };

  return `
USE THE PROVIDED PHOTO AS THE EXACT STRUCTU
RAL BASE.

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
