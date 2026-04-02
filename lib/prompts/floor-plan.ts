const BASE_PROMPT = `
TASK: Convert the input 2D floor plan into a photorealistic 3D architectural render.

STRICT REQUIREMENTS — DO NOT VIOLATE:
1) REMOVE ALL TEXT: Do not render any letters, numbers, labels, dimensions, or annotations. Floors must be continuous where text used to be.
2) GEOMETRY MUST MATCH: Walls, rooms, doors, and windows must follow the exact lines and positions in the plan. Do not shift or resize.
3) CLEAN, REALISTIC OUTPUT: Crisp edges, balanced lighting, and realistic materials. No sketch or hand-drawn look.
4) NO EXTRA CONTENT: Do not add rooms, furniture, or objects that are not clearly indicated by the plan.

STRUCTURE & DETAILS:
- Walls: Extrude precisely from the plan lines. Consistent wall height and thickness.
- Doors: Convert door swing arcs into open doors, aligned to the plan.
- Windows: Convert thin perimeter lines into realistic glass windows.

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
- Finish: professional architectural visualization. No text, no watermarks, no logos.
`.trim();

const floorPlanStyles: Record<string, string> = {
  Modern: "large-format light grey or white polished concrete or stone floors, white smooth walls, sleek low-profile furniture with clean straight lines, recessed ceiling lighting, open-plan feel, neutral palette of white/grey/black with one warm accent",
  Scandinavian: "light natural oak or pale birch wood floors, white walls, cosy wool rugs in muted tones, simple functional furniture with tapered legs, warm pendant lighting, soft textiles — linen cushions and throws, plants, understated and uncluttered",
  Industrial: "polished or raw concrete floors, exposed red brick or dark grey walls, black steel window frames, dark metal-frame furniture with reclaimed wood surfaces, Edison bulb pendant lighting, leather or canvas upholstery, raw and urban atmosphere",
  Rustic: "wide-plank reclaimed oak or pine wood floors, exposed stone or whitewashed walls, heavy wooden ceiling beams, chunky farmhouse furniture in natural wood, wrought-iron fixtures, earthy warm tones — terracotta, cream, brown, cosy and lived-in feel",
  Luxury: "large-format marble or travertine floors with subtle veining, high ceilings, wall panelling or textured wallpaper in deep jewel tones, statement chandelier lighting, rich upholstered furniture in velvet or leather, gold or brass accents on fixtures and handles, art on walls",
  Minimalist: "seamless light grey or white micro-cement or polished concrete floors, pure white walls with zero decoration, only essential furniture — one sofa, one coffee table, one bed — all in neutral white or greige, hidden storage, single pendant light, absolute calm and emptiness",
};

const anglePrompts: Record<string, string> = {
  topDown: `
CAMERA ANGLE — STRICT TOP-DOWN (OVERHEAD PLAN VIEW):
CRITICAL: Camera is mounted directly overhead, pointing straight down at 90 degrees. Zero perspective tilt. Zero angle. Purely flat like looking at a map.
No roof, no ceiling, no walls visible from the side. Only the floor, furniture tops, and room layout visible from above.
This must look like an architectural floor plan rendered in 3D — not a dollhouse, not isometric. Pure bird's-eye overhead.`,

  isometric: `
Create a detailed 3D architectural dollhouse render based on the provided floor plan. Use a strictly isometric, three-quarter front-corner perspective. Position the camera looking downward at a roughly 45-degree angle towards the near-front corner of the building. This corner must be clearly visible and the lowest point of the frame, showing depth and both of the front exterior wall faces (left and right) in equal perspective. The roof is removed to reveal all interior rooms with their vertical wall faces. The resulting image must look like a physical open-top model with depth and perspective, not a flat, overhead 2D plan. Place the entire model on a clean white presentation base against a pure white studio background.`,

  exterior: `
CAMERA ANGLE — EXTERIOR DRONE VIEW (OUTSIDE THE BUILDING):
CRITICAL: Camera is OUTSIDE the building, hovering like a drone at 45 degrees above ground level. Show the FULL exterior of the building.
The roof is fully visible and closed. Show exterior facade, roof materials, windows, front door, and surrounding ground/garden.
NO interior is visible. This is a purely exterior architectural render — like a real estate drone photo. The building sits in its environment with landscaping around it.`,

  crossSection: `
Create a detailed 3D architectural dollhouse render based on the provided floor plan. Use a strictly isometric, three-quarter front-corner perspective. Position the camera looking downward at a roughly 45-degree angle towards the near-front corner of the building. This corner must be clearly visible and the lowest point of the frame, showing depth and both of the front exterior wall faces (left and right) in equal perspective. The roof is removed to reveal all interior rooms with their vertical wall faces. The resulting image must look like a physical open-top model with depth and perspective, not a flat, overhead 2D plan. Place the entire model on a clean dark presentation base against a pure dark studio background.

NIGHT ATMOSPHERE: This is a night-time render. The interior of every room is warmly lit with soft golden artificial lighting glowing from inside. Ceiling lights, floor lamps and accent lighting visible inside each room. The exterior walls are dark. Warm light spills out through doorways between rooms. Dramatic contrast between the dark exterior walls and the warm glowing interiors.`,

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
