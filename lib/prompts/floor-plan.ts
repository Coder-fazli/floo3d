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
CAMERA ANGLE — ISOMETRIC DOLLHOUSE (OPEN-TOP CUTAWAY):
CRITICAL: Camera is positioned at exactly 45 degrees from a corner — equal distance from all four sides. Classic dollhouse/isometric view.
No roof — the top is fully open so all rooms are visible. Walls are visible and show full height. Furniture and interior details visible from this angled perspective.
The building should look like a dollhouse model viewed from a diagonal corner above. All four exterior walls and all interior rooms visible simultaneously.`,

  exterior: `
CAMERA ANGLE — EXTERIOR DRONE VIEW (OUTSIDE THE BUILDING):
CRITICAL: Camera is OUTSIDE the building, hovering like a drone at 45 degrees above ground level. Show the FULL exterior of the building.
The roof is fully visible and closed. Show exterior facade, roof materials, windows, front door, and surrounding ground/garden.
NO interior is visible. This is a purely exterior architectural render — like a real estate drone photo. The building sits in its environment with landscaping around it.`,

  entrance: `
CAMERA ANGLE — FIRST-PERSON ENTRANCE (GROUND LEVEL, LOOKING IN):
CRITICAL: Camera is at human eye level (1.6m height), standing just inside or at the front entrance door, looking straight into the main living area.
Strong forced perspective — the room depth recedes into the distance. Ceiling visible above. Floor stretching forward. Walls on both sides creating a corridor effect.
Show furniture, windows with natural light flooding in, and the full depth of the interior space. This must feel like a photograph taken by a person standing at the door.`,

  crossSection: `
CAMERA ANGLE — CROSS-SECTION CUT (SLICED BUILDING):
CRITICAL: The building is sliced in half with a clean vertical cut through the middle. The front half of the building is completely removed — as if cut with a knife.
The exposed cut face shows wall thickness, floor layers, and ceiling height. All rooms visible from the side in full depth.
Show multiple floors/levels if present. Furniture, ceiling fixtures, and floor materials all visible inside each room. This must look like an architectural section drawing rendered in 3D — like a doll's house sliced open from the front.`,
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
