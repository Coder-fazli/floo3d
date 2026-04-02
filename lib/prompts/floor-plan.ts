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
CAMERA ANGLE — ISOMETRIC 3D FLOOR PLAN (MEDIUM HEIGHT CORNER):
CRITICAL: Camera is at a medium-high diagonal angle from a corner — high enough to see all rooms clearly from above, but low enough that walls are visible and have clear height.
Walls are visible but the interior floor layout is the main focus — rooms, furniture, and layout are all clearly readable.
No roof — open top. The building sits on a clean light grey or white surface/ground with subtle shadow underneath. Clean white background.
This must look like a professional 3D floor plan visualization — the style used by real estate agencies and architects to show apartment layouts. Crisp, clean, neutral colors, all rooms visible and readable.`,

  exterior: `
CAMERA ANGLE — EXTERIOR DRONE VIEW (OUTSIDE THE BUILDING):
CRITICAL: Camera is OUTSIDE the building, hovering like a drone at 45 degrees above ground level. Show the FULL exterior of the building.
The roof is fully visible and closed. Show exterior facade, roof materials, windows, front door, and surrounding ground/garden.
NO interior is visible. This is a purely exterior architectural render — like a real estate drone photo. The building sits in its environment with landscaping around it.`,

  entrance: `
CAMERA ANGLE — STREET VIEW (FRONT FACADE, GROUND LEVEL EXTERIOR):
CRITICAL: Camera is at street level, standing on the pavement or path directly in front of the building, looking straight at the front facade.
Show the full front face of the building: front door, windows, exterior wall materials, roof edge or roofline visible at the top.
This is a straight-on exterior photo — like a real estate listing photo taken from the street. No interior visible. Show the front garden, path, or driveway in the foreground. Natural daylight, realistic outdoor environment.`,

  crossSection: `
CAMERA ANGLE — NIGHT VIEW (EXTERIOR AT NIGHT):
CRITICAL: This is an exterior shot at night. Dark sky, artificial lighting only.
Warm golden light glows from inside through all windows and doors. Exterior facade lit by outdoor wall lights or garden spotlights.
Show the full exterior of the building from a 45-degree angle — roof, walls, windows, entrance, and surrounding garden or ground all visible.
The contrast between the dark exterior and warm glowing interior light is the key visual. This must look like a real estate exterior photo taken at dusk or night — dramatic, warm, and atmospheric.`,
};

export function buildFloorPlanPrompt(style: string, viewAngle: string = "topDown"): string {
  const detail = floorPlanStyles[style] ?? `materials, colors and furniture typical of ${style} interior design`;
  const angle = anglePrompts[viewAngle] ?? anglePrompts.topDown;
  return `
${BASE_PROMPT}

${angle}

DESIGN STYLE — ${style.toUpperCase()}:
Apply the following specific aesthetic throughout the entire render: ${detail}.
Every room visible in the plan must consistently use these materials, colors and furniture style.
`.trim();
}
