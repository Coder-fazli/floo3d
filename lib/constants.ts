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
  if (inputType === "room-photo") {
    return `
TASK: Apply a ${style} interior design style to this room photo. This is a renovation, NOT a full redesign — the room must remain clearly recognisable.

STRICT REQUIREMENTS — DO NOT VIOLATE:
1) **SAME CAMERA ANGLE**: Do not move, rotate or change the perspective in any way.
2) **SAME ROOM STRUCTURE**: Walls, ceiling, floor layout, windows, doors and any fixed built-ins (bathtub, toilet, kitchen counters, built-in wardrobes) stay in EXACTLY the same position and proportion.
3) **SAME ROOM DIMENSIONS**: Do not make the room larger, smaller or change its shape.
4) **NO TEXT OR WATERMARKS**: Output must be completely clean.

WHAT TO CHANGE — APPLY ${style.toUpperCase()} STYLE:
Use these specific style details: ${(() => {
  const roomStyles: Record<string, string> = {
    Modern:       "light grey or white polished floors, smooth white or light grey walls, sleek low-profile furniture with clean lines, recessed or track lighting, minimal decor, neutral palette with one warm accent colour",
    Scandinavian: "light natural wood or pale laminate floors, soft white walls, simple functional furniture with tapered legs, warm pendant lights, cosy linen/wool textiles in muted tones, small potted plants",
    Industrial:   "dark concrete or aged wood floors, exposed brick or raw plaster walls left as-is, black metal-frame furniture with wood or leather surfaces, Edison bulb pendants, urban raw atmosphere",
    Rustic:       "warm wood plank floors, stone or rough plaster walls, chunky solid wood furniture, wrought-iron or ceramic light fixtures, earthy tones — cream, brown, terracotta, cosy layered textiles",
    Luxury:       "marble-look or herringbone parquet floors, wall panelling or rich wallpaper, statement chandelier or designer pendant, velvet or leather upholstered furniture, gold or brass hardware and accents",
    Minimalist:   "seamless light grey or white floors, pure white walls with zero art or decoration, only one or two essential furniture pieces in white or greige, single overhead light, total calm and emptiness",
  };
  return roomStyles[style] || `materials and furniture typical of ${style} interior design`;
})()}.

- **Floor**: Replace floor surface using the style details above (same floor area and shape).
- **Walls**: Restyle wall finish/colour to match the style — do not move or resize walls.
- **Moveable furniture**: Replace sofas, chairs, tables, beds, rugs, curtains with style-appropriate pieces.
- **Lighting fixtures**: Replace ceiling lights, floor lamps, wall sconces with ones matching the style.
- **Decor**: Replace art, plants, cushions and accessories with style-appropriate items.

WHAT MUST STAY THE SAME:
- The exact position and shape of every wall, window, door and opening.
- All fixed structural elements (bathtub, shower, toilet, kitchen units, staircases).
- The overall spatial feel — the output must look like the same room after a renovation.

FINISH: Photorealistic output. Professional interior photography quality. Natural lighting consistent with the original photo. No watermarks.
    `.trim();
  }

  if (inputType === "outdoor") {
    const outdoorStyles: Record<string, string> = {
      Mediterranean: "terracotta or limestone paving, whitewashed stone walls, olive and cypress trees, wooden pergola draped with climbing vines, large terracotta pots with lavender and rosemary, wrought-iron furniture with cushions, warm earthy tones throughout",
      Japanese: "raked zen gravel with stone arrangements, koi pond or water basin, bamboo screen fencing, stone lanterns and stepping-stone path, bonsai and maple trees, minimalist wooden deck, moss ground cover, calm and serene atmosphere",
      Tropical: "lush oversized palm trees and banana leaf plants, natural stone or timber decking, infinity-edge pool or water feature, rattan and teak outdoor furniture, string lights and torch lighting, vibrant flowering plants, rich green canopy overhead",
      Cottage: "colourful wildflower beds and climbing roses on trellises, irregular stone or brick path, white picket or low hedgerow border, rustic wooden bench, herb and vegetable garden corner, soft dappled natural lighting, quaint and lush feel",
      Modern: "large-format concrete or porcelain paving in neutral tones, geometric lawn panels, architectural ornamental grasses and box hedges, minimalist steel-frame pergola, sleek low-profile outdoor furniture, recessed path lighting, clean lines throughout",
      Desert: "decomposed granite or sandy gravel ground, clusters of cacti and succulent arrangements, natural sandstone boulders, drought-resistant agave and yucca plants, low adobe or rammed-earth walls, warm terracotta and sand tones, minimal water use",
    };

    const styleDetail = outdoorStyles[style] || `materials, plants, furniture and lighting typical of ${style} landscape design`;

    return `
TASK: Redesign this outdoor space in ${style} landscape design style.

STRICT REQUIREMENTS:
1) **KEEP THE SAME VIEW ANGLE**: Do not change the camera perspective or viewing angle.
2) **KEEP THE SAME BOUNDARIES AND STRUCTURES**: Fences, walls, built structures stay in exact same position.
3) **REPLACE ALL EXISTING PLANTS, FURNITURE AND DECOR**: Remove everything and redesign entirely.
4) **NO TEXT OR WATERMARKS**: Output must be clean with no labels or annotations.

REDESIGN WITH ${style.toUpperCase()} OUTDOOR AESTHETIC:
Use the following specific elements: ${styleDetail}.

- Ground: Replace with ground cover, paving or decking matching the style above.
- Plants: Add realistic plants, trees, and shrubs exactly as described.
- Furniture: Add outdoor seating and dining pieces that fit the style.
- Lighting: Add appropriate outdoor lighting (path lights, lanterns, string lights, etc.).
- Decor: Add water features, planters, or decorative elements consistent with the style.

FINISH: Photorealistic output. Professional landscape photography quality. Natural daylight lighting. No watermarks.
    `.trim();
  }

  // 2D Floor Plan — specific per style
  const floorPlanStyles: Record<string, string> = {
    Modern:        "large-format light grey or white polished concrete or stone floors, white smooth walls, floor-to-ceiling windows where indicated, sleek low-profile furniture with clean straight lines, recessed ceiling lighting, open-plan feel, neutral palette of white/grey/black with one warm accent",
    Scandinavian:  "light natural oak or pale birch wood floors, white walls, cosy wool rugs in muted tones, simple functional furniture with tapered legs, warm pendant lighting, soft textiles — linen cushions and throws, plants, understated and uncluttered",
    Industrial:    "polished or raw concrete floors, exposed red brick or dark grey walls, black steel window frames, dark metal-frame furniture with reclaimed wood surfaces, Edison bulb pendant lighting, leather or canvas upholstery, raw and urban atmosphere",
    Rustic:        "wide-plank reclaimed oak or pine wood floors, exposed stone or whitewashed walls, heavy wooden ceiling beams, chunky farmhouse furniture in natural wood, wrought-iron fixtures, earthy warm tones — terracotta, cream, brown, cosy and lived-in feel",
    Luxury:        "large-format marble or travertine floors with subtle veining, high ceilings, wall panelling or textured wallpaper in deep jewel tones, statement chandelier lighting, rich upholstered furniture in velvet or leather, gold or brass accents on fixtures and handles, art on walls",
    Minimalist:    "seamless light grey or white micro-cement or polished concrete floors, pure white walls with zero decoration, only essential furniture — one sofa, one coffee table, one bed — all in neutral white or greige, hidden storage, single pendant light, absolute calm and emptiness",
  };

  const floorDetail = floorPlanStyles[style] || `materials, colors and furniture typical of ${style} interior design`;

  return `
${FLOOR_PLAN_PROMPT}

DESIGN STYLE — ${style.toUpperCase()}:
Apply the following specific aesthetic throughout the entire render: ${floorDetail}.
Every room visible in the plan must consistently use these materials, colors and furniture style.
  `.trim();
}
