const BASE_PROMPT = `
TASK: Convert the input 2D floor plan (which may be a blueprint, CAD export, technical drawing, or hand-drawn plan in any color — blue, black, white, grey or other) into a high-quality architectural render.

LAYOUT FIDELITY — HIGHEST PRIORITY:
- Count every room visible in the input and render EXACTLY that many rooms. Do not merge, drop, or add rooms.
- Walls, partitions, doors, and windows must follow the exact positions and proportions shown in the plan. Do not shift, rotate, or resize any element.
- If a room is small in the plan, keep it small. If a room is large, keep it large.

STRICT OUTPUT RULES — DO NOT VIOLATE:
1) TEXT IN OUTPUT: Do not render any letters, numbers, labels, dimensions, or annotations in the OUTPUT image. Read and use any text in the input to understand room types — but produce zero visible text in the result.
2) CLEAN OUTPUT: Crisp edges, balanced lighting, and realistic materials. No sketch, cartoon or hand-drawn look.
3) NO EXTRA CONTENT: Do not add rooms, furniture, or objects that are not clearly indicated by the plan.
4) IGNORE INPUT COLOURS: The input is a technical drawing and may be any colour. Do not carry input colours into the output. All colours must come exclusively from the design style defined below.

STRUCTURE & DETAILS:
- Walls: Extrude precisely from the plan lines. Consistent wall height and thickness throughout.
- Doors: In top-down view, convert door swing arcs into open doors aligned to the plan. In isometric, exterior or night views, render doors as closed.
- Windows: Convert thin perimeter lines into realistic glass windows with frames.

FURNITURE & ROOM MAPPING (only where icons or fixtures are clearly shown):
- Bed icon → realistic bed with duvet and pillows.
- Sofa icon → modern sectional or sofa.
- Dining table icon → table with chairs.
- Kitchen icon → counters with sink and stove.
- Bathroom icon → toilet, sink, and tub/shower.
- Office/study icon → desk, chair, and minimal shelving.
- Porch/patio/balcony icon → simple outdoor seating (keep minimal).
- Utility/laundry icon → washer/dryer and minimal cabinetry.

STYLE & LIGHTING:
- Lighting: bright, neutral daylight. High clarity and balanced contrast.
- Materials: realistic wood/tile floors, clean walls, subtle shadows.
- Finish: professional architectural visualization. No text, no watermarks, no logos.
`.trim();

const floorPlanStyles: Record<string, string> = {
  Modern: "large-format light grey or white polished concrete or stone tile floors, pure white smooth walls, sleek low-profile furniture with clean straight lines and flat surfaces — no carvings, no curves, no patterns, recessed ceiling lighting only, open-plan feel, strict neutral palette of white, grey and black only — no warm wood tones, no plants, no organic textures, no decorative objects",
  Scandinavian: "light natural oak or pale birch wood floors, white walls, cosy wool rugs in muted tones, simple functional furniture with tapered legs, warm pendant lighting, soft textiles — linen cushions and throws, plants, understated and uncluttered",
  Industrial: "polished or raw concrete floors, exposed red brick or dark grey walls, black steel window frames, dark metal-frame furniture with reclaimed wood surfaces, Edison bulb pendant lighting, leather or canvas upholstery, raw and urban atmosphere",
  Rustic: "wide-plank reclaimed oak or pine wood floors, exposed stone or whitewashed walls, heavy wooden ceiling beams, chunky farmhouse furniture in natural wood, wrought-iron fixtures, earthy warm tones — terracotta, cream, brown, cosy and lived-in feel",
  Luxury: "large-format marble or travertine floors with subtle veining, high ceilings, wall panelling or textured wallpaper in deep jewel tones, statement chandelier lighting, rich upholstered furniture in velvet or leather, gold or brass accents on fixtures and handles, art on walls",
  Minimalist: "seamless light grey or white micro-cement or polished concrete floors, pure white walls with zero decoration, only essential furniture — one sofa, one coffee table, one bed — all in neutral white or greige, hidden storage, single pendant light, absolute calm and emptiness",
};

const anglePrompts: Record<string, string> = {
  topDown: `
CAMERA ANGLE — TOP-DOWN PLAN RENDER VIEW:
Camera is mounted directly overhead at exactly 90 degrees, pointing straight down. Zero tilt, zero perspective distortion. This is a rendered plan view — not isometric, not dollhouse.
Only the floor surface, furniture tops, and the room layout are visible. Wall tops appear as thin lines. No wall faces, no ceiling, no exterior visible.
The result must look like an architectural floor plan brought to life in 3D materials and lighting — viewed purely from directly above like a map.`,

  isometric: `
CAMERA ANGLE — ISOMETRIC DOLLHOUSE VIEW:
Create a detailed 3D architectural dollhouse render. Use a strictly isometric three-quarter front-corner perspective. Camera looks downward at roughly 45 degrees toward the near-front corner of the building — this corner is the lowest point of the frame, with both front exterior wall faces visible in equal perspective.
The roof is fully removed to reveal all interior rooms with their full-height walls, furniture, and finishes.
The result must look like a physical open-top architectural model — with clear depth, wall thickness, and perspective. Not flat, not overhead.
Place the entire model on a clean white presentation base against a pure white studio background.`,

  exterior: `
CAMERA ANGLE — EXTERIOR DRONE VIEW:
Camera is OUTSIDE the building, hovering like a drone at 45 degrees above ground level. Show the FULL exterior of the building.
The roof is fully closed and visible. Show the exterior facade, roof materials, windows, front door, and surrounding ground or garden.
NO interior is visible — this is a purely exterior architectural render like a real estate drone photo. The building sits in its environment with simple landscaping around it.`,

  crossSection: `
CAMERA ANGLE — ISOMETRIC NIGHT DOLLHOUSE VIEW:
Create a detailed 3D architectural dollhouse render. Use a strictly isometric three-quarter front-corner perspective. Camera looks downward at roughly 45 degrees toward the near-front corner of the building — this corner is the lowest point of the frame, with both front exterior wall faces visible in equal perspective.
The roof is fully removed to reveal all interior rooms with their full-height walls, furniture, and finishes.
The result must look like a physical open-top architectural model — with clear depth, wall thickness, and perspective. Not flat, not overhead.
Place the entire model on a clean dark charcoal presentation base against a pure dark studio background.

NIGHT ATMOSPHERE: This is a night-time render. Every room interior is warmly lit with soft golden artificial lighting — ceiling lights, floor lamps, and accent lighting glowing from inside each room. Warm light spills through doorways. Dramatic contrast between the dark exterior walls and the warm glowing interiors.`,
};

export function buildFloorPlanPrompt(style: string, viewAngle: string = "topDown"): string {
  const detail = floorPlanStyles[style] ?? `materials, colors and furniture typical of ${style} interior design`;
  const angle = anglePrompts[viewAngle] ?? anglePrompts.topDown;
  return `
${angle}

${BASE_PROMPT}

DESIGN STYLE — ${style.toUpperCase()}:
Apply the following specific aesthetic throughout the entire render: ${detail}.
Every room visible in the plan must consistently use these materials, colors and furniture style.
`.trim();
}
