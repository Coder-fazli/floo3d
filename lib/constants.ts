// Timing Constants (in milliseconds)
export const REDIRECT_DELAY_MS = 600;
export const PROGRESS_INTERVAL_MS = 100;
export const PROGRESS_STEP = 5;

// Image Dimensions
export const IMAGE_RENDER_DIMENSION = 1024;

const FLOOR_PLAN_PROMPT = `
TASK: Convert the input 2D floor plan into a **photorealistic, top‑down 3D architectural render**.

STRICT REQUIREMENTS (do not violate):
1) **REMOVE ALL TEXT**: Do not render any letters, numbers, labels, dimensions, or annotations. Floors must be continuous where text used to be.
2) **GEOMETRY MUST MATCH**: Walls, rooms, doors, and windows must follow the exact lines and positions in the plan. Do not shift or resize.
3) **TOP‑DOWN ONLY**: Orthographic top‑down view. No perspective tilt.
4) **CLEAN, REALISTIC OUTPUT**: Crisp edges, balanced lighting, and realistic materials. No sketch/hand‑drawn look.
5) **NO EXTRA CONTENT**: Do not add rooms, furniture, or objects that are not clearly indicated by the plan.

STRUCTURE & DETAILS:
- **Walls**: Extrude precisely from the plan lines. Consistent wall height and thickness.
- **Doors**: Convert door swing arcs into open doors, aligned to the plan.
- **Windows**: Convert thin perimeter lines into realistic glass windows.

FURNITURE & ROOM MAPPING (only where icons/fixtures are clearly shown):
- Bed icon → realistic bed with duvet and pillows.
- Sofa icon → modern sectional or sofa.
- Dining table icon → table with chairs.
- Kitchen icon → counters with sink and stove.
- Bathroom icon → toilet, sink, and tub/shower.
- Office/study icon → desk, chair, and minimal shelving.
- Porch/patio/balcony icon → outdoor seating or simple furniture (keep minimal).
- Utility/laundry icon → washer/dryer and minimal cabinetry.

STYLE & LIGHTING:
- Lighting: bright, neutral daylight. High clarity and balanced contrast.
- Materials: realistic wood/tile floors, clean walls, subtle shadows.
- Finish: professional architectural visualization; no text, no watermarks, no logos.
`.trim();

export function buildPrompt(inputType: string, style: string): string {

  // ─── EMPTY THE ROOM ───────────────────────────────────────────────────────
  if (inputType === "empty-room") {
    return `
USE THE PROVIDED PHOTO AS THE EXACT STRUCTURAL BASE.

GLOBAL RULES — DO NOT VIOLATE UNDER ANY CIRCUMSTANCES:
1) Keep the exact same camera angle and perspective — do not rotate, zoom or shift the viewpoint.
2) Keep all walls, ceilings, floors, doors, windows and architectural features exactly as they are.
3) Do not change the size or shape of the room.
4) Keep all fixed built-in elements in place — kitchen units, bathroom fixtures (toilet, sink, bath/shower), built-in wardrobes, fireplaces, staircases.
5) No text, labels or watermarks in the output.

TASK — EMPTY THE ROOM:
Remove every piece of movable furniture and decor from the room:
- REMOVE: sofas, chairs, tables, beds, desks, shelving units, floor lamps, table lamps, rugs, cushions, throws, curtains, blinds, artwork, wall art, plants, decorative objects, electronics, cables, and any other non-fixed items.
- KEEP: bare walls, bare floors, ceiling, windows (with natural light passing through), doors, and all permanently fixed architectural elements.

FLOOR & WALLS:
- Where furniture or rugs covered the floor, reveal the continuous floor surface underneath in a matching material and texture.
- Where objects were against walls, show clean, uninterrupted bare wall surface.

LIGHTING:
- Maintain natural light entering through windows. Preserve the time-of-day and light direction from the original photo.
- Remove all portable lighting. Keep ceiling-mounted or recessed fixtures only if they were visible in the original photo.

FINISH: The result should look like a professionally photographed empty room — freshly cleared, bright and photorealistic, ready for new furniture planning. No watermarks.
    `.trim();
  }

  // ─── ROOM PHOTO ───────────────────────────────────────────────────────────
  if (inputType === "room-photo") {

    const roomStyles: Record<string, { rules: string; feel: string }> = {
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

    const s = roomStyles[style] ?? {
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

ROOM INTERPRETATION:
First identify the room type visible in the photo (living room, bedroom, kitchen, bathroom, etc.).
Preserve the functional layout of that room type throughout the redesign — do not place bedroom furniture in a living room or vice versa.

STYLE APPLICATION — ${style.toUpperCase()}:
Apply the style strongly but realistically, as if the room was professionally redesigned by an interior designer while keeping its original architecture intact.
Only modify: movable furniture, floor surface, wall finish, lighting fixtures and decorative objects.
${s.rules}

STYLE FEEL:
${s.feel}

FINISH: The result should look like a professionally photographed interior renovation of the same room. Lighting direction, window light and time-of-day must remain consistent with the input photo. No watermarks.
    `.trim();
  }

  // ─── OUTDOOR ──────────────────────────────────────────────────────────────
  if (inputType === "outdoor") {
    const outdoorStyles: Record<string, string> = {
      Mediterranean: "terracotta or limestone paving, whitewashed stone walls, olive and cypress trees, wooden pergola draped with climbing vines, large terracotta pots with lavender and rosemary, wrought-iron furniture with cushions, warm earthy tones throughout",
      Japanese:      "raked zen gravel with stone arrangements, koi pond or water basin, bamboo screen fencing, stone lanterns and stepping-stone path, bonsai and maple trees, minimalist wooden deck, moss ground cover, calm and serene atmosphere",
      Tropical:      "lush oversized palm trees and banana leaf plants, natural stone or timber decking, infinity-edge pool or water feature, rattan and teak outdoor furniture, string lights and torch lighting, vibrant flowering plants, rich green canopy overhead",
      Cottage:       "colourful wildflower beds and climbing roses on trellises, irregular stone or brick path, white picket or low hedgerow border, rustic wooden bench, herb and vegetable garden corner, soft dappled natural lighting, quaint and lush feel",
      Modern:        "large-format concrete or porcelain paving in neutral tones, geometric lawn panels, architectural ornamental grasses and box hedges, minimalist steel-frame pergola, sleek low-profile outdoor furniture, recessed path lighting, clean lines throughout",
      Desert:        "decomposed granite or sandy gravel ground, clusters of cacti and succulent arrangements, natural sandstone boulders, drought-resistant agave and yucca plants, low adobe or rammed-earth walls, warm terracotta and sand tones, minimal water use",
    };

    const styleDetail = outdoorStyles[style] || `materials, plants, furniture and lighting typical of ${style} landscape design`;

    return `
USE THE PROVIDED PHOTO AS THE EXACT STRUCTURAL BASE.

GLOBAL RULES — DO NOT VIOLATE:
1) Keep the exact same camera angle and perspective.
2) Keep all boundary walls, fences and permanent built structures in exact position.
3) Do not change the size or shape of the outdoor space.
4) No text, labels or watermarks in the output.

REDESIGN WITH ${style.toUpperCase()} OUTDOOR AESTHETIC:
Use the following specific elements: ${styleDetail}.

- Ground: Replace with ground cover, paving or decking matching the style above.
- Plants: Add realistic plants, trees and shrubs exactly as described.
- Furniture: Add outdoor seating and dining pieces that fit the style.
- Lighting: Add appropriate outdoor lighting — path lights, lanterns, string lights, etc.
- Decor: Add water features, planters or decorative elements consistent with the style.

Apply the style strongly but realistically, as if professionally landscaped.

FINISH: Photorealistic output. Professional landscape photography quality. Natural daylight lighting. No watermarks.
    `.trim();
  }

  // ─── 2D FLOOR PLAN ────────────────────────────────────────────────────────
  const floorPlanStyles: Record<string, string> = {
    Modern:       "large-format light grey or white polished concrete or stone floors, white smooth walls, sleek low-profile furniture with clean straight lines, recessed ceiling lighting, open-plan feel, neutral palette of white/grey/black with one warm accent",
    Scandinavian: "light natural oak or pale birch wood floors, white walls, cosy wool rugs in muted tones, simple functional furniture with tapered legs, warm pendant lighting, soft textiles — linen cushions and throws, plants, understated and uncluttered",
    Industrial:   "polished or raw concrete floors, exposed red brick or dark grey walls, black steel window frames, dark metal-frame furniture with reclaimed wood surfaces, Edison bulb pendant lighting, leather or canvas upholstery, raw and urban atmosphere",
    Rustic:       "wide-plank reclaimed oak or pine wood floors, exposed stone or whitewashed walls, heavy wooden ceiling beams, chunky farmhouse furniture in natural wood, wrought-iron fixtures, earthy warm tones — terracotta, cream, brown, cosy and lived-in feel",
    Luxury:       "large-format marble or travertine floors with subtle veining, high ceilings, wall panelling or textured wallpaper in deep jewel tones, statement chandelier lighting, rich upholstered furniture in velvet or leather, gold or brass accents on fixtures and handles, art on walls",
    Minimalist:   "seamless light grey or white micro-cement or polished concrete floors, pure white walls with zero decoration, only essential furniture — one sofa, one coffee table, one bed — all in neutral white or greige, hidden storage, single pendant light, absolute calm and emptiness",
  };

  const floorDetail = floorPlanStyles[style] || `materials, colors and furniture typical of ${style} interior design`;

  return `
${FLOOR_PLAN_PROMPT}

DESIGN STYLE — ${style.toUpperCase()}:
Apply the following specific aesthetic throughout the entire render: ${floorDetail}.
Every room visible in the plan must consistently use these materials, colors and furniture style.
  `.trim();
}
