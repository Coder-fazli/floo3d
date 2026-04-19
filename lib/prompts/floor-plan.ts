const BASE_PROMPT = `
⚠ ABSOLUTE RULE — ZERO TEXT IN OUTPUT: The output image must contain NO text, NO letters, NO numbers, NO room labels, NO dimension annotations, NO legends, NO watermarks of any kind. The input floor plan will contain text — use it only to understand the layout. Do NOT reproduce any of it visually. Any text appearing in the output makes the result a failure.

TASK: Convert the input 2D floor plan (which may be a blueprint, CAD export, technical drawing, or hand-drawn plan in any color — blue, black, white, grey or other) into a high-quality architectural render.

LAYOUT FIDELITY — HIGHEST PRIORITY:
- Count every room visible in the input and render EXACTLY that many rooms. Do not merge, drop, or add rooms.
- Walls, partitions, doors, and windows must follow the exact positions and proportions shown in the plan. Do not shift, rotate, or resize any element.
- If a room is small in the plan, keep it small. If a room is large, keep it large. Preserve all relative proportions.
- Wall thickness must be consistent and proportional to room size throughout — exterior walls visibly thicker than interior partitions.

STRICT OUTPUT RULES:
1. TEXT IN OUTPUT: See absolute rule above — zero text, letters, numbers, or annotations in the output under any circumstances.
2. CLEAN OUTPUT: Crisp edges, balanced lighting, realistic materials. No sketch, cartoon or hand-drawn look.
3. NO EXTRA CONTENT: Do not add rooms, furniture, or objects not clearly indicated in the plan.
4. IGNORE INPUT COLOURS: The input is a technical drawing and may be any colour. Do not carry input colours into the output. All colours come exclusively from the design style defined below.
5. WINDOWS ON EXTERIOR WALLS ONLY: Convert thin perimeter lines on exterior-facing walls into realistic glass windows. Do not place windows on interior partition walls.
6. CONSISTENT LIGHT SOURCE: Light comes from the top-left. All shadows fall consistently in the bottom-right direction. No contradictory lighting.

STRUCTURE & DETAILS:
- Walls: extruded precisely from the plan lines. Exterior walls thicker and more solid than interior partitions.
- Doors: in top-down view, convert door swing arcs into open doors aligned to the plan. In isometric, exterior or night views, render doors as closed.
- Windows: exterior-wall perimeter lines become realistic glass windows with frames and subtle reflections.
- Stairs: if visible in the plan, render as parallel steps with consistent riser height.

FURNITURE & ROOM MAPPING (only where icons or fixtures are clearly shown in the plan):
- Bed icon → realistic bed with duvet, pillows and bedside table.
- Sofa icon → modern sofa or sectional with coffee table.
- Dining table icon → table with chairs on all sides.
- Kitchen icon → counters along walls with sink, stove and fridge.
- Bathroom icon → toilet, sink, and shower cubicle or bathtub.
- Office/study icon → desk against wall, chair, minimal shelving.
- Porch/balcony icon → simple outdoor furniture (keep minimal).
- Utility/laundry icon → washer/dryer and minimal cabinetry.

STYLE & MATERIALS:
- Lighting: bright neutral daylight for top-down and isometric. Consistent with top-left light source.
- Materials: realistic wood or tile floors, clean plaster walls, subtle shadows under furniture.
- Finish: professional architectural visualisation quality. No watermarks, no logos, no borders.
`.trim();

const floorPlanStyles: Record<string, string> = {
  Modern:       "PHOTOREALISTIC 3D RENDER ONLY — NO pencil lines, NO sketch lines, NO blueprint lines, NO technical drawing artifacts anywhere in the output. Large-format warm light concrete or pale stone tile floors (not pure white — use a subtle warm beige-grey tone to distinguish from walls), pure white smooth plaster walls, sleek low-profile furniture with clean straight lines, no carvings, no curves, no patterns, recessed ceiling lighting only, neutral palette of warm white, light grey and charcoal accents, no warm wood tones, no plants, no organic textures. The result must look like a professional architectural CGI render, not a drawing.",
  Scandinavian: "light natural oak or pale birch wood floors, white walls, cosy wool rugs in muted tones, simple functional furniture with tapered legs, warm pendant lighting, soft linen textiles, subtle plants, understated and uncluttered",
  Industrial:   "polished or raw concrete floors, exposed red brick or dark grey walls, black steel window frames, dark metal-frame furniture with reclaimed wood surfaces, Edison bulb pendant lighting, leather or canvas upholstery, raw urban atmosphere",
  Rustic:       "wide-plank reclaimed oak or pine wood floors, exposed stone or whitewashed walls, heavy wooden ceiling beams, chunky farmhouse furniture in natural wood, wrought-iron fixtures, earthy warm tones — terracotta, cream, brown, cosy and lived-in",
  Luxury:       "large-format marble or travertine floors with subtle veining, high ceilings, wall panelling in deep jewel tones, statement chandelier lighting, rich velvet or leather upholstered furniture, gold or brass accents on all fixtures and handles, original art on walls",
  Minimalist:   "seamless light grey or white micro-cement floors, pure white walls with zero decoration, only essential furniture — one sofa, one coffee table, one bed — all in neutral white or greige, hidden storage, single pendant light, absolute calm and emptiness",
};

const anglePrompts: Record<string, string> = {
  topDown: `
CAMERA ANGLE — TOP-DOWN PLAN RENDER VIEW:
Camera mounted directly overhead at exactly 90 degrees, pointing straight down. Zero tilt, zero perspective distortion.
This is a rendered plan view — not isometric, not dollhouse. Only floor surfaces, furniture tops, and room layout visible from above. Wall tops appear as lines.
Result must look like an architectural floor plan rendered with 3D materials and lighting — viewed purely from directly above like a map.
Light source: directly above. Shadows fall straight down — visible only as thin outlines under furniture.`,

  isometric: `
CAMERA ANGLE — ISOMETRIC DOLLHOUSE VIEW:
Strict isometric three-quarter front-corner perspective. Camera looks down at roughly 45 degrees toward the near-front corner — this corner is the lowest point in the frame. Both front exterior wall faces visible in equal perspective.
Roof fully removed to show all interior rooms with full-height walls, furniture and finishes.
Wall height consistent throughout at approximately 2.7 metres standard ceiling height.
Light source: top-left. Left-facing walls are lighter, right-facing walls have a medium shadow, floor surfaces are brightest.
Result must look like a physical open-top architectural model with clear depth, wall thickness and perspective — not flat, not overhead.
Place the entire model on a clean white presentation base against a pure white studio background.`,

  exterior: `
CAMERA ANGLE — EXTERIOR DRONE VIEW:
Camera OUTSIDE the building, hovering like a drone at 45 degrees above ground level.
Roof fully closed and clearly visible with realistic roofing material. Show the full exterior facade, windows, front door and surrounding ground.
NO interior visible — purely exterior architectural render like a real estate drone photo.
Light source: top-left sun at 45 degrees. Shadows fall to the bottom-right on all exterior surfaces.
Building sits in its environment with simple clean landscaping — green lawn, paved path to front door.`,

  crossSection: `
CAMERA ANGLE — ISOMETRIC NIGHT DOLLHOUSE VIEW:
Strict isometric three-quarter front-corner perspective. Camera looks down at roughly 45 degrees toward the near-front corner — this corner is the lowest point in the frame. Both front exterior wall faces visible in equal perspective.
Roof fully removed to show all interior rooms with full-height walls, furniture and finishes.
Wall height consistent throughout at approximately 2.7 metres standard ceiling height.
Place the model on a clean dark charcoal presentation base against a pure dark studio background.

NIGHT ATMOSPHERE: Every room interior is warmly lit with soft golden artificial lighting — ceiling pendants, floor lamps and accent lights glowing inside each room. Warm light spills through doorways between rooms. Strong contrast between the dark exterior walls and the warm glowing interiors. No daylight — purely artificial warm interior lighting.`,
};

export function buildFloorPlanPrompt(style: string, viewAngle: string = "topDown"): string {
  const detail = floorPlanStyles[style] ?? `materials, colors and furniture typical of ${style} interior design`;
  const angle = anglePrompts[viewAngle] ?? anglePrompts.topDown;
  return `
${angle}

${BASE_PROMPT}

DESIGN STYLE — ${style.toUpperCase()}:
Apply the following specific aesthetic consistently throughout the entire render: ${detail}.
Every room visible in the plan must use these exact materials, colours and furniture style — no mixing of styles between rooms.
`.trim();
}
