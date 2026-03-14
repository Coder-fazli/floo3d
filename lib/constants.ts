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
TASK: Redesign this room photo in ${style} interior design style.

STRICT REQUIREMENTS:
1) **KEEP THE SAME VIEW ANGLE**: Do not change the camera perspective or viewing angle.
2) **KEEP THE SAME ROOM SHAPE**: Walls, windows, doors, and ceiling height stay in exact same position.
3) **REMOVE ALL EXISTING FURNITURE AND DECOR**: Clear out everything — furniture, rugs, curtains, art, plants, lighting fixtures.
4) **NO TEXT OR WATERMARKS**: Output must be clean with no labels or annotations.

REDESIGN WITH ${style.toUpperCase()} AESTHETIC:
- Floors: Replace with materials typical of ${style} design.
- Walls: Paint or finish walls in colors that match ${style} palette.
- Furniture: Add realistic furniture pieces typical of ${style} — sofa, coffee table, shelving, bed (if bedroom), dining set (if dining).
- Lighting: Add ceiling and ambient lighting fixtures matching ${style}.
- Decor: Add minimal but realistic decor — rugs, cushions, plants, art — consistent with ${style}.

FINISH: Photorealistic output. Professional interior photography quality. Balanced natural lighting. No watermarks.
    `.trim();
  }

  if (inputType === "outdoor") {
    return `
TASK: Redesign this outdoor space in ${style} landscape design style.

STRICT REQUIREMENTS:
1) **KEEP THE SAME VIEW ANGLE**: Do not change the camera perspective or viewing angle.
2) **KEEP THE SAME BOUNDARIES AND STRUCTURES**: Fences, walls, built structures stay in exact same position.
3) **REPLACE ALL PLANTS, FURNITURE AND DECOR**: Clear out existing landscaping and replace entirely.
4) **NO TEXT OR WATERMARKS**: Output must be clean with no labels or annotations.

REDESIGN WITH ${style.toUpperCase()} OUTDOOR AESTHETIC:
- Ground: Replace with paving, grass, gravel, or decking typical of ${style} outdoor design.
- Plants: Add realistic plants, trees, and shrubs matching ${style} landscape style.
- Furniture: Add outdoor seating, dining, and lounging furniture typical of ${style}.
- Lighting: Add outdoor lighting fixtures — path lights, spotlights, string lights — matching ${style}.
- Decor: Add planters, water features, or decorative elements consistent with ${style}.

FINISH: Photorealistic output. Professional architectural photography quality. Natural daylight lighting. No watermarks.
    `.trim();
  }

  // Default — 2D Floor Plan (original prompt + style)
  return `
${FLOOR_PLAN_PROMPT}

DESIGN STYLE: Apply a ${style} interior design aesthetic throughout the render.
Use materials, colors, furniture and finishes typical of ${style} design.
  `.trim();
}
