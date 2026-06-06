// Virtual staging: take an EMPTY room photo and furnish it — add tasteful, realistically
// scaled furniture & decor while keeping the room's architecture exactly as-is.

const styleHints: Record<string, string> = {
  Modern: "Clean geometric furniture, low-profile silhouettes, neutral palette (greige, off-white, charcoal accents), honest materials (walnut, matte black metal, polished concrete, smooth leather/wool). No patterns, minimal decor.",
  Scandinavian: "Light wood legs, soft neutral upholstery, layered textiles (a simple rug, linen cushions, a throw), warm-toned pendant lighting, 1–2 small potted plants. Soft whites, muted greys, warm wood.",
  Industrial: "Sturdy raw furniture — metal frames, leather or canvas, reclaimed wood surfaces. Bare Edison-bulb or metal cage lighting. Charcoal, black, rust and aged-metal tones.",
  Rustic: "Solid natural farmhouse wood, chunky and warm. Linen/cotton textiles in earthy tones, wrought-iron or ceramic lighting, a few handmade ceramic or wooden objects.",
  Luxury: "Plush upholstered and sculptural pieces — velvet, leather, marble and polished stone surfaces. A statement chandelier or sculptural pendant, gold/brass/chrome accents, fresh flowers and curated decor.",
  Minimalist: "Only the single most essential piece per function. Bare surfaces, zero decorative clutter, one flat white/off-white palette, a single recessed or flush ceiling light.",
  Coastal: "Light airy furniture, slipcovered sofas, natural fibers (jute, rattan), soft blues and sandy neutrals, breezy linen textiles and a few coastal accents.",
  "Mid-Century": "Tapered wooden legs, organic curved silhouettes, warm woods (teak, walnut), muted retro accent tones (mustard, olive, burnt orange used sparingly), globe or sputnik lighting.",
};

// Each entry describes the room's PURPOSE, essentials and arrangement discipline —
// but lets the AI decide how MUCH furniture based on the actual room size it sees.
const stagingByRoom: Record<string, string> = {
  "Living Room": `Stage as a LIVING ROOM. Anchor the seating around a clear focal point and ground it with an area rug. Scale the amount to the room: a single sofa in a compact space, or a sectional plus accent chairs in a larger one. Add the surfaces and lighting a lounge needs (coffee/side tables, a TV unit or console, layered lamps) and a few grouped decorative objects. Keep generous, believable walkways.`,
  "Bedroom": `Stage as a BEDROOM. The bed is the focal point — centred on the main wall with balanced space on both sides and layered, inviting bedding. Add the supporting pieces a bedroom needs (nightstands with lamps, storage such as a wardrobe or dresser, optional bench/reading chair if the room is large enough) and a rug partly under the bed. Scale quantity to the room and keep clear walkways around the bed and storage.`,
  "Kitchen": `Stage a KITCHEN/eat-in area with FREESTANDING items only — do NOT add or change cabinets, counters or appliances. Add seating that suits the space (bar stools at an island/peninsula, and/or a breakfast table with chairs only if there is real floor room) plus light, tasteful counter styling. Keep most counter surface clear.`,
  "Dining Room": `Stage as a DINING ROOM. The table and its overhead light are the centrepiece. Add a dining table sized to the room with a matching set of chairs, a pendant/chandelier centred ~30–36in above the table, an optional sideboard with styling on a long wall, and a rug large enough that chairs stay on it when pulled out.`,
  "Office": `Stage as a HOME OFFICE. The desk is the anchor — positioned toward natural light or the door, paired with an ergonomic chair. Add vertical storage (shelving/bookcase, neatly arranged) and task lighting, scaled to the room. Keep the desk surface tidy and cables out of sight.`,
  "Dining": `Stage as a DINING area: a table sized to the room with a matching set of chairs, a centred pendant/chandelier ~30–36in above, an optional styled sideboard, and a correctly sized rug.`,
  "Studio": `Stage as a STUDIO/open-plan. Define distinct zones without walls — a sleeping zone (bed toward the far/private end) and a living zone (seating + rug facing a focal point) — using furniture groupings and rugs, plus multifunctional storage. Scale each zone to the available space and give each its own light source.`,
  "Kids Room": `Stage as a KIDS ROOM. A child-scaled bed is the hero, supported by a small study area, accessible storage (low shelving or bins) and a soft play rug. One controlled accent colour on the bedding or a single piece is encouraged — keep the rest neutral. Scale to the room.`,
  "Nursery": `Stage as a NURSERY. A cot/crib is the focal point, supported by a comfortable feeding chair with a side table and lamp, a dresser/changing unit, and a soft rug. Calm, uncluttered, gentle neutral-pastel decor. Scale to the room.`,
};

export function buildVirtualStagingPrompt(style: string, roomType?: string, customPrompt?: string): string {
  const hint = styleHints[style] ?? `Furnish the room in a cohesive ${style} style, with realistically scaled furniture, appropriate materials, and tasteful decor.`;
  const room = roomType
    ? (stagingByRoom[roomType] ?? `Stage the room appropriately for its function as a ${roomType}, with realistically scaled furniture and tasteful decor.`)
    : `Identify the room's function from the photo and stage it appropriately with realistically scaled furniture and tasteful decor.`;

  const base = `
USE THE PROVIDED PHOTO OF AN EMPTY ROOM AS THE EXACT STRUCTURAL BASE.

GLOBAL RULES — DO NOT VIOLATE UNDER ANY CIRCUMSTANCES:
1) Keep the exact same camera angle and perspective — do not rotate, zoom or shift the viewpoint.
2) Keep ALL architecture exactly as it is — walls, ceiling, floor, doors, windows, openings, columns, niches and their positions, sizes and proportions. Do not add, remove, move or resize any architectural feature.
3) Do not change the size or shape of the room.
4) Keep the existing floor and wall materials and finishes. Do not re-paint walls or replace flooring — only add an area rug on top of the existing floor where appropriate.
5) Keep all fixed built-in elements exactly in place (kitchen units, bathroom fixtures, built-in wardrobes, fireplaces, radiators, staircases).
6) Preserve the windows and the natural light direction and time-of-day from the original photo. Render brightly and professionally, as a real-estate photograph would.
7) No text, labels, people, pets or watermarks in the output.

TASK — VIRTUALLY STAGE (FURNISH) THE EMPTY ROOM:
Add realistic, professionally arranged furniture and decor so the empty room looks like a styled, move-in-ready space — exactly as a real-estate virtual staging service would. You are ADDING furniture to an empty room, NOT redesigning or rebuilding it.

${room}

PLACEMENT & REALISM RULES:
- Scale every piece correctly to the real dimensions implied by the room, doors and windows. Furniture must sit flat on the floor with correct perspective, contact shadows and proportions — never floating, never oversized, never toy-like.
- Do not block doors, windows or walkways. Leave believable circulation space.
- Do not cover or hide architectural features (windows, fireplaces, radiators) — arrange furniture around them.
- Keep the amount of furniture realistic for the room size — enough to read as fully staged, not cramped.
- Lighting on the added furniture must match the room's existing light direction and colour temperature so it looks like a single real photograph.

STYLE — ${style.toUpperCase()}:
${hint}

FINISH: The result should look like a professionally photographed, tastefully furnished version of the SAME empty room — same walls, same windows, same floor, same camera angle — now staged and ready to sell. No watermarks.
`.trim();

  if (customPrompt?.trim()) {
    const sanitized = customPrompt.trim().replace(/<[^>]*>/g, "").slice(0, 1000);
    return `${base}\n\nADDITIONAL USER REQUIREMENTS:\n${sanitized}\nThese requirements take priority over default style guidelines where they conflict.`;
  }

  return base;
}
