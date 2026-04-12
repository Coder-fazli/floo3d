import { StyleDef } from "./types";

const interiorStyles: Record<string, StyleDef> = {
  Modern: {
    rules: `
- COLOUR: Apply the 70-20-10 rule strictly. 70% neutral foundation — whites, cool greys, warm greige, or deep charcoal for walls, floors and large surfaces. 20% secondary tone — one consistent mid-tone across soft furnishings and rugs, either muted earth (tobacco, slate, warm taupe) OR a single muted jewel tone (deep sage, dusty navy, muted terracotta) — never both. 10% accent — matte black, brushed stainless steel, or polished chrome hardware, frames and fixtures only. No warm saturated colours. No mixed colour schemes.
- CONTRAST: Modern design lives on deliberate contrast. Pair light walls with dark furniture, or dark walls with light upholstery. Pair smooth leather with raw concrete. Pair polished stone with matte plaster. At least one strong contrast pair must be visible in the render.
- FURNITURE: Replace or adapt all ornate, carved or curved decorative pieces. Furniture must read as geometric and angular — flat surfaces, clean edges, low-profile silhouettes with long horizontal lines. Exposed legs in metal or dark wood are correct. Upholstery in smooth leather, solid-colour wool or neutral linen only — no patterns, no tufting, no fringe. Multi-functional pieces preferred — storage ottomans, extendable tables.
- SURFACES: Walls must be flat matte in a single neutral — no wallpaper, no panelling, no decorative texture. Floor must remain the same material as input but rendered cleaner — wood floors appear as horizontal-grain walnut, ash or maple; tile appears uniform and seamless; concrete appears polished or honed. No rugs with patterns — solid or subtle texture only.
- MATERIALS: Prioritise honest, structural materials — polished or raw concrete, marble with clean straight veining, walnut or ash wood with visible horizontal grain, brushed stainless steel, matte black metal, slate. No rattan, no jute, no wicker, no reclaimed distressed wood.
- LIGHTING: Replace or adapt all fixtures so they read as geometric and intentional — recessed ceiling spots, track lighting systems, geometric pendant lights with clean metal shades, or simple floor lamps with cylindrical shades. No visible Edison bulbs, no ornate shades, no warm-glow lantern fixtures. Maximise natural light from existing windows — do not add or move windows.
- OBJECTS: Maximum 2 decorative objects total in the frame. Each must be structural in feel — a single piece of large-format abstract wall art, a concrete or ceramic vessel, a sculptural lamp base. No plants, no dried botanicals, no books stacked for decoration, no candles, no textile throws unless folded flat.
- FORBIDDEN: No ornate carving or surface decoration. No mixed patterns of any kind. No warm brass or gold tones. No farmhouse, rustic or organic-style elements. No clutter. Nothing that reads as Scandinavian, Bohemian or Rustic.`,
    feel: "Architecturally confident and precisely edited — high contrast, honest materials, geometric clarity. The room feels curated by a designer who removed everything unnecessary and made every remaining element count.",
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
- FURNITURE: Keep only the single most essential piece of furniture for the room's function — one sofa, or one bed, or one table. Remove everything else. No side tables, no extra chairs, no shelving unless built-in.
- OBJECTS: Zero decorative objects. No plants, no vases, no candles, no art, no cushions with patterns, no rugs. Surfaces must be completely bare.
- SURFACES: Adapt the existing floor — do not replace it with a completely different material. Make it appear as clean and seamless as possible. Walls must be a single flat white or off-white — no texture, no panelling, no variation.
- LIGHTING: One light source only — a recessed ceiling light or a single flush ceiling fixture. Remove all lamps, sconces and secondary fixtures.
- COLOUR: White and off-white only. One accent neutral (light grey or pale beige) is permitted for a single upholstered surface. Nothing else. No warm tones, no wood, no patterns of any kind.
- FORBIDDEN: No plants. No rugs. No cushions. No decorative objects of any kind. No curtain patterns. Curtains if present must be plain white or off-white and flat against the wall.`,
    feel: "Radical emptiness — every object that remains had to earn its place. The room breathes because almost nothing is in it.",
  },
};

const roomRules: Record<string, string> = {
  "Living Room": `
ROOM-SPECIFIC RULES — LIVING ROOM:
- FOCAL POINT: Establish one dominant focal point — fireplace, large-format artwork, or a statement wall. All furniture must face or relate to this focal point. Do not scatter visual attention across multiple competing elements.
- FURNITURE PROPORTIONS: Sofa must be two-thirds the length of the primary wall it faces. Coffee table must be half the length of the sofa. Allow minimum 18–24 inches between sofa and coffee table. Allow 30–36 inches of clear walkway between large pieces.
- SEATING: One primary sofa, maximum one accent chair. Do not add extra chairs unless the room is clearly a large open-plan space. Arrange all seating to face the focal point — never push everything against the walls.
- RUG: If a rug is present or added, it must be large enough for at least the front two legs of every seating piece to rest on it. Never use an undersized rug floating in the centre.
- LIGHTING: Three layers required — ambient (ceiling), task (floor or table lamp), accent (highlighting the focal point). No single overhead light as the only source.
- OBJECTS: Maximum 3 decorative objects total. Group in odd numbers (1 or 3). Use negative space — not every surface needs to be filled.`,

  "Bedroom": `
ROOM-SPECIFIC RULES — BEDROOM:
- FOCAL POINT: The bed is the undisputed focal point and must be centred on the longest wall, ideally opposite or diagonal to the door so it is visible upon entry. Every other element in the room must support, not compete with, the bed.
- BED PLACEMENT: Centre the bed on its wall with equal space on both sides. Minimum 24–30 inches of clear walkway on each side of the bed and in front of any wardrobe or dresser. Never push the bed into a corner unless the room makes it impossible.
- FIXED ELEMENTS: Do not move the bed to a completely different wall. Do not add or remove built-in wardrobes.
- LIGHTING: No single harsh overhead light. Use bedside sconces mounted at shoulder height when seated, or pendant lights hung from the ceiling over each nightstand. Add a dimmer-appropriate ambient source. Lighting must feel soft, layered, and adjustable.
- TEXTILES: Bedding is the dominant surface in this room — it must look luxurious, layered and considered. Linen, cotton or velvet in a solid or subtly tonal pattern. Add one throw, folded. Two to four cushions maximum — no decorative cushion piles.
- OBJECTS: Maximum 2 objects per bedside surface. One framed artwork above the bed or on a side wall — never more than two pieces of wall art total. No overhead clutter.`,

  "Kitchen": `
ROOM-SPECIFIC RULES — KITCHEN:
- FIXED ELEMENTS: All kitchen units, cabinets, appliances, sink and island are fixed in position. Do not move, add or remove structural kitchen elements. Only modify: cabinet door finish, countertop surface, wall colour, lighting fixtures, and small objects.
- COUNTERTOPS: The countertop is the dominant design surface — it must appear as a premium material. Quartz with clean straight veining, honed marble, or polished concrete are correct. No busy patterns, no laminate appearance, no tile countertops.
- CABINETS: Flat-front or shaker-style only — no ornate raised-panel doors, no glass fronts unless already present. Two-tone is acceptable — lighter uppers, darker lowers. Matte or satin finish preferred over high gloss.
- ISLAND: If an island is present, treat it as the room's focal point. Waterfall countertop edge is preferred. Pendant lights above the island must hang 30 inches above the surface. Use 2–3 evenly spaced pendants for a long island; one larger pendant for a square island.
- LIGHTING: Three layers — recessed ambient ceiling lights, pendant task lighting over island or peninsula, under-cabinet strip lighting over work surfaces. No single central ceiling fixture as the only source.
- OBJECTS: Keep countertops 80% clear. Maximum 3 objects on the counter — one hero object (large ceramic vessel, wooden board, or quality appliance) plus 1–2 functional items. No cluttered spice racks, no paper towels visible.`,

  "Bathroom": `
ROOM-SPECIFIC RULES — BATHROOM:
- FIXED ELEMENTS: Toilet, bathtub, shower enclosure, vanity unit and sink are all fixed. Do not move or remove any plumbing fixture. Do not add fixtures that did not exist in the original photo.
- FOCAL POINT: Choose one standout feature to elevate — a distinctive mirror, a statement tile wall behind the vanity or shower, or a freestanding bath if present. Everything else should support this one feature.
- TILE: Tile must either cover the full wall surface or stop at a clean horizontal line flush with the surface above — never leave a ragged or arbitrary tile edge. Large-format tiles (60×60cm or larger) read as more premium and modern. Avoid busy patterns — geometric or textural tiles in a single neutral tone.
- VANITY LIGHTING: Overhead recessed light plus wall-mounted sconces or a horizontal vanity bar at face height on either side of or above the mirror — never a single overhead light which casts shadows on the face.
- MIRROR: The mirror is a key design element. Oversized frameless mirrors or mirrors with a thin metal frame extend the visual space. Mirror width should match or slightly exceed the vanity width.
- SPATIAL DISCIPLINE: Do not add objects, towel rails, or accessories that crowd the space. Maximum 3 visible accessories — a soap dispenser, one plant or vessel, and one folded towel. Keep all surfaces as clear as possible.`,

  "Office": `
ROOM-SPECIFIC RULES — HOME OFFICE:
- FOCAL POINT: The desk is the architectural anchor of the room. Position it to face the door where possible, or angled toward natural light. The desk and chair must be the dominant visual element.
- DESK: Minimum 48 inches (120cm) wide. 60 inches (150cm) preferred for a professional appearance. Surface must appear clear — maximum 3 functional objects on the desk (monitor, lamp, one organiser). No clutter, no papers, no cables visible.
- CHAIR: The office chair is the single most important object in the room. It must appear ergonomic and well-designed — not a generic basic chair. Mesh, leather or high-quality fabric in a neutral tone.
- STORAGE: Prioritise vertical storage — wall shelves, built-in cabinets, or a bookcase. Storage must appear organised and intentional — books arranged by colour or size, objects grouped logically. No visible chaos.
- LIGHTING: Layered — ambient ceiling light plus a dedicated task lamp on or beside the desk with an adjustable arm. Natural light from a window is a priority — position desk to benefit from it without screen glare.
- MATERIALS: Walnut or dark wood for desk surfaces conveys authority. Glass and light oak read as bright and modern. Avoid cheap-looking particleboard finishes. Metal accents in matte black or brushed steel.`,

  "Dining Room": `
ROOM-SPECIFIC RULES — DINING ROOM:
- FOCAL POINT: The dining table and its overhead lighting are the centrepiece of the entire room. Every other element — sideboard, artwork, rug — must support this axis, not compete with it.
- TABLE PROPORTIONS: The dining table must be proportionate to the room — allow minimum 36 inches (90cm) of clearance on all sides for chair movement. Do not add a table that is too large for the space.
- PENDANT LIGHTING: Pendant or chandelier must hang 30–36 inches (75–90cm) above the table surface. For a single pendant, diameter should be one-half to two-thirds the table width. For a long rectangular table, use 2–3 evenly spaced pendants or a linear suspension fixture. This is non-negotiable — incorrect pendant height is the most common dining room design error.
- CHAIRS: Dining chairs must be consistent in style — do not mix radically different chair designs unless it is clearly an intentional eclectic choice. Upholstered seats in a solid fabric add comfort and visual weight.
- SIDEBOARD OR BUFFET: If wall space allows, one sideboard or credenza on the longest wall adds storage and a surface for styling. Keep it to maximum 3 objects — a mirror or artwork above it, one vessel, one lamp.
- LIGHTING MOOD: Dining lighting must be dimmable and warm. The overhead fixture provides ambient and focal light — supplement with a wall sconce or buffet lamp for layered warmth.`,

  "Studio": `
ROOM-SPECIFIC RULES — STUDIO / OPEN-PLAN:
- ZONING: A studio must be visually divided into distinct zones without physical walls — use rugs, lighting and furniture groupings to define: sleeping zone, living zone, and if present, a working zone. Each zone must be legible at a glance.
- SLEEPING ZONE: The bed must be positioned to feel private — against a wall, ideally furthest from the entrance. Use a headboard, pendant lights above or behind the bed, or a floor-to-ceiling curtain panel to visually separate it.
- LIVING ZONE: A sofa or seating group facing a focal point (TV unit, artwork, or window) defines the living area. A rug is essential to anchor this zone and separate it from the sleeping area.
- VERTICAL SPACE: In a compact studio, use vertical height — tall shelving, floor-to-ceiling curtains, high-mounted shelves — to draw the eye upward and make the space feel larger.
- MULTIFUNCTIONAL FURNITURE: Every piece must earn double duty where possible — storage ottomans, sofa beds, desks that fold flat, beds with under-storage. Remove any furniture that serves only one function if space is tight.
- LIGHTING: Each zone needs its own light source — the sleeping area needs bedside lighting, the living area needs a floor or table lamp, the working area needs task lighting. Never rely on a single central overhead light.`,

  "Hallway": `
ROOM-SPECIFIC RULES — HALLWAY / ENTRANCE:
- FOCAL POINT: The far end of the hallway — or the first thing visible upon entry — must have a deliberate focal point. A mirror, a piece of artwork, a console table with a lamp, or a statement light fixture. Never let the hallway terminate in a blank wall.
- MIRROR: A mirror is almost always correct in a hallway — it reflects light, makes the space feel wider, and serves a functional purpose. Size it generously — at minimum 60cm wide. Position it at eye level.
- CONSOLE TABLE: If floor width allows (minimum 90cm clear walking width must remain), a narrow console table (max 35cm deep) anchors the entrance and provides a surface for 1–2 objects — a lamp and one vessel or tray.
- LIGHTING: A hallway with only a central ceiling light feels institutional. Add a wall sconce, a pendant at a lower height, or uplighting to create warmth. If the hallway is long, use multiple light sources to break it into segments.
- FLOOR: The floor is the dominant surface in a hallway — it must appear as a premium, durable material. Large-format tile, continuous wood, or polished concrete. No small mosaic tiles, no carpet unless already present and in good condition.
- OBJECTS: Maximum discipline — a hallway must not feel cluttered. One mirror, one console or shelf, one lamp, one small object. Nothing on the floor except one intentional piece (a plant, a sculptural object).`,

  "Kids Room": `
ROOM-SPECIFIC RULES — KIDS ROOM:
- FOCAL POINT: The bed is still the focal point — but it can be more playful in form. A loft bed, a canopy, a colourful headboard wall, or a built-in reading nook can serve as the hero element.
- COLOUR: This is the one room where a controlled accent colour is not just allowed but encouraged. Choose one bold accent colour (a primary or saturated tone) applied to one wall, the bed frame, or the shelving. Balance it with white or soft neutral on the remaining surfaces — never apply bold colour to all four walls.
- FURNITURE: Keep it low-profile and scaled to a child — undersized furniture makes the room feel bigger and more functional. A bed, a desk or study area, and storage are the three essential pieces. Avoid oversized adult-scale furniture.
- STORAGE: Generous, accessible storage is non-negotiable — open shelving at child height, colourful bins, or built-in cubbies. Storage must look intentional and organised, not chaotic.
- LIGHTING: A central ceiling light plus a dedicated desk task lamp and a softer bedside lamp or nightlight. Avoid harsh single overhead lighting.
- FLOOR: A rug defines the play zone — it should be large, soft, and in a pattern or colour that anchors the room without competing with the wall accent colour.`,
};

export function buildInteriorDesignPrompt(style: string, roomType?: string): string {
  const s = interiorStyles[style] ?? {
    rules: `- Replace or adapt the room's furniture, surfaces, lighting and decor so they match ${style} design principles.`,
    feel: `A professionally redesigned ${style} interior.`,
  };

  const rr = roomType ? (roomRules[roomType] ?? "") : "";

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
${rr}

STYLE APPLICATION — ${style.toUpperCase()}:
Apply the style strongly but realistically, as if the room was professionally redesigned by an interior designer while keeping its original architecture intact.
Only modify: movable furniture, floor surface, wall finish, lighting fixtures and decorative objects.
${s.rules}

STYLE FEEL:
${s.feel}

FINISH: The result should look like a professionally photographed interior renovation of the same room. Lighting direction, window light and time-of-day must remain consistent with the input photo. No watermarks.
`.trim();
}
