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
CAMERA ANGLE — ISOMETRIC DOLLHOUSE (LOW CORNER VIEW):
CRITICAL: This is NOT a top-down view. The camera is positioned LOW — at the same height as the walls, looking from a corner diagonal.
The WALLS must fill at least 60% of the image height. The floor/interior should only be a small portion visible at the top of the image.
Think of a physical dollhouse on a table — you are sitting at the table looking at the corner of the dollhouse at eye level. You see mostly walls and only a little bit of the interior from above.
No roof. Open top. Corner diagonal view. LOW camera. Walls dominate the image.`,

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
CAMERA ANGLE — 3D CUTAWAY (LOW CORNER ANGLE, WALLS DOMINANT):
CRITICAL: Camera is positioned LOW at a corner — at the same height as the walls, looking diagonally into the building from a corner. This is NOT top-down.
Walls must be very tall and fill most of the image. The interior floor and furniture are visible from this low diagonal angle inside each room.
No roof — open top. The building floats on a clean white background like a 3D architectural model.
This must look exactly like a professional 3D floor plan render: low diagonal corner camera, tall prominent walls, all rooms visible inside, clean white background, realistic materials and furniture.`,
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
