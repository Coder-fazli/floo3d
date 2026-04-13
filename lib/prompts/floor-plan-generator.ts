export interface FloorPlanGeneratorConfig {
    propertyType: string;
    area: number;
    areaUnit: "m2" | "sqft";
    floors: number;
    rooms: {
      bedroom: number;
      bathroom: number;
      kitchen: number;
      livingRoom: number;
      diningRoom: number;
      office: number;
    };
    extras: {
    garage: boolean;
    balcony: boolean;
    terrace: boolean;
    garden: boolean;
    }
  style: "blueprint" | "colored" | "isometric" | "3d top-down";
}

const stylePrompts: Record<string, string> = {
    blueprint: `OUTPUT STYLE — ARCHITECTURAL BLUEPRINT:
White or black lines on a contrasting background (dark blue or white). Precise and technical.
- Walls: double lines. Exterior walls noticeably thicker (≈ 3× line width) than interior partitions.
- Doors: standard quarter-circle swing arc on the wall line, showing opening direction.
- Windows: three parallel lines spanning the wall opening on exterior walls only.
- Stairs (if multi-floor): parallel lines with directional arrow labelled "UP".
- Room labels: clean sans-serif text centred inside each room.
- North arrow in top-right corner.
- NO furniture, NO decorative objects, NO color fills, NO gradients, NO shadows, NO dimensions text.`,

    colored: `OUTPUT STYLE — COLORED 2D FLOOR PLAN:
Top-down 2D plan with flat pastel-colored rooms. Clean and readable.
- Room fills: living room warm beige, bedrooms soft blue, kitchen light yellow, bathrooms light teal, dining muted green, office light grey, corridors/hallways off-white.
- Exterior walls thick solid dark lines. Interior partition walls thinner.
- Furniture as simple flat 2D icons in a slightly darker shade of the room color.
- Doors: thin quarter-circle arcs showing opening direction. Windows: short perpendicular lines on exterior walls.
- Room name labels centred in each room.
- NO gradients, NO shadows, NO 3D effects, NO dimensions text.`,

    isometric: `OUTPUT STYLE — ISOMETRIC 3D DOLLHOUSE:
Strict isometric perspective — camera at 45 degrees looking down at the front corner. Roof fully removed.
- Wall height: approximately 2.7 metres (standard ceiling height). Consistent across all rooms.
- Exterior walls clearly thicker and more solid than interior partitions.
- Light source: top-left. Consistent soft shadows on all right-facing and floor surfaces.
- Realistic furniture and materials per room type, correctly scaled to wall height.
- Clean white or light grey studio background. Building sits on a thin white presentation base.
- NO text, NO labels, NO annotations, NO watermarks.`,

    "3d top-down": `OUTPUT STYLE — PHOTOREALISTIC 3D TOP-DOWN:
Camera at exactly 90 degrees overhead. Zero tilt, zero perspective distortion — purely flat like a map but in 3D.
- Ceiling fully removed. All rooms visible from directly above.
- Wall height consistent (≈ 2.7m). Walls cast short downward shadows onto the floor.
- Light source: directly above with slight ambient from top-left. Soft uniform shadows.
- Realistic floor materials per room: hardwood in living/dining/bedroom, tile in kitchen/bathroom, carpet in office.
- Furniture rendered from directly above: bed rectangle with pillow circle, sofa rectangle, table with chairs, counters, toilet D-shape, sink oval.
- NO text, NO labels, NO watermarks.`,
}

export function buildFloorPlanGeneratorPrompt(config: FloorPlanGeneratorConfig): string {
    const { propertyType, area, areaUnit, floors, rooms, extras, style } = config;

    const areaM2 = areaUnit === "sqft" ? Math.round(area * 0.0929) : area;
    const areaDisplay = `${area} ${areaUnit} (≈ ${areaM2} m²)`;

    const roomList = [
        rooms.bedroom    > 0 && `${rooms.bedroom} Bedroom${rooms.bedroom > 1 ? "s" : ""}`,
        rooms.bathroom   > 0 && `${rooms.bathroom} Bathroom${rooms.bathroom > 1 ? "s" : ""}`,
        rooms.kitchen    > 0 && `${rooms.kitchen} Kitchen`,
        rooms.livingRoom > 0 && `${rooms.livingRoom} Living Room`,
        rooms.diningRoom > 0 && `${rooms.diningRoom} Dining Room`,
        rooms.office     > 0 && `${rooms.office} Office`,
        extras.garage    && "Garage",
        extras.balcony   && "Balcony",
        extras.terrace   && "Terrace",
        extras.garden    && "Garden",
    ].filter(Boolean).join(", ");

    const activeExtras = [
        extras.garage  && "Garage: attached to the building on a side wall with a direct interior door entry. Sized for at least one car.",
        extras.balcony && "Balcony: accessible via a glass door from the living room or master bedroom. Shown as an open outdoor slab with a railing on the exterior edge.",
        extras.terrace && "Terrace: a larger paved outdoor area connected to the ground floor via sliding or double doors. Shown with a distinct floor pattern (e.g. stone grid).",
        extras.garden  && "Garden: a clearly bounded outdoor area adjacent to the building, shown with a grass texture or green fill. Must not exceed the building footprint in size.",
    ].filter(Boolean);

    const extrasBlock = activeExtras.length > 0
        ? `EXTRAS — include all of the following:\n${activeExtras.map(e => `- ${e}`).join("\n")}`
        : "";

    const floorBlock = floors > 1
        ? `FLOORS: ${floors}-floor building. Show the GROUND FLOOR PLAN ONLY. Place a staircase near the entrance hall or a central corridor — draw it as parallel lines with an "UP" arrow. Label the drawing "Ground Floor".`
        : `FLOORS: Single-storey building.`;

    const furnitureRule = style === "blueprint"
        ? "NO furniture of any kind. Show fixed elements only: walls, doors (swing arcs), windows, stairs, built-in kitchen counter outline, bathroom fixture outlines (toilet D, sink oval, bath rectangle)."
        : `Add furniture to every room:
- Living room: sofa, coffee table, TV unit against a wall.
- Bedroom: bed (sized to room — double or single), bedside tables, wardrobe along a wall.
- Kitchen: L-shaped or linear counter with sink, stove, and fridge. Counter along walls, not floating.
- Dining room: rectangular dining table with chairs on all sides.
- Bathroom: toilet, sink, and shower cubicle or bathtub — arranged to fit the room without overlapping.
- Office: desk against a wall, office chair, small bookshelf.
All furniture must be correctly scaled to the room and wall height. No furniture floating outside room boundaries.`;

    return `Generate a precise, professional architectural floor plan for the following property.

PROPERTY TYPE: ${propertyType}
TOTAL AREA: ${areaDisplay}
ROOMS REQUIRED: ${roomList}
${floorBlock}

BUILDING FOOTPRINT:
- Use a compact, realistic building shape — preferably rectangular or a simple L-shape. No irregular, fragmented or disconnected shapes.
- The building outline must form a single closed perimeter. All rooms must sit inside this perimeter.
- The main entrance (front door) faces the bottom edge of the image. Street side is bottom.

ROOM LAYOUT RULES — FOLLOW ALL STRICTLY:
1. AREA SCALE: Total built area is ${areaDisplay}. Every room must be proportionally sized to this total. Do not make rooms too large or too small for a ${areaM2} m² ${propertyType}.
2. ROOM SIZE HIERARCHY: Living room = largest room. Bedrooms = medium-large. Kitchen and dining = medium. Bathrooms = smallest. Office ≈ bedroom size.
3. COMPLETENESS: Every room in the list must appear exactly once: ${roomList}. Do not add unlisted rooms. Do not omit any listed room.
4. CIRCULATION: Include a small entrance hallway at the front door. Add narrow corridors only where needed to connect rooms. Every room must be accessible through its own door — never only through another room (except en-suite bathrooms directly off a master bedroom).
5. LOGICAL ADJACENCY: Kitchen must be adjacent or directly connected to dining room. Living room near the entrance. Bedrooms grouped together away from kitchen and living areas. Bathrooms adjacent to the bedrooms they serve. Office away from bedrooms if space allows.
6. WET ROOMS: Kitchen and bathrooms should share or be near a common plumbing wall. Group them on the same side of the building where possible.
7. WALLS: Exterior walls thicker than interior partitions throughout. All walls are straight and aligned to a grid — no diagonal walls. No gaps in the building perimeter.
8. OPENINGS: Every room has at least one door. Windows appear on exterior walls only — never on interior partition walls. Every habitable room (bedroom, living, kitchen, dining, office) has at least one exterior window.
9. NO OVERLAPPING: Rooms must not overlap each other. Every part of the floor plan belongs to exactly one room, wall, or corridor.
${extrasBlock ? `\n${extrasBlock}` : ""}

FURNITURE & FIXTURES:
${furnitureRule}

${stylePrompts[style]}`;
}
