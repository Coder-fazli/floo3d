export function buildEmptyRoomPrompt(): string {
  return `
USE THE PROVIDED PHOTO AS THE EXACT STRUCTURAL BASE.

GLOBAL RULES — DO NOT VIOLATE UNDER ANY CIRCUMSTANCES:
1) Keep the exact same camera angle and perspective — do not rotate, zoom or shift the viewpoint.
2) Keep all walls, ceilings, floors, doors, windows and architectural features exactly as they are.
3) Do not change the size or shape of the room.
4) Keep all fixed built-in elements in place — kitchen units, bathroom fixtures (toilet, sink, bath/shower), built-in wardrobes, fireplaces, staircases.
5) No text, labels or watermarks in the output.

TASK — EMPTY THE ROOM:
Remove every piece of movable furniture and decor from the room:
- REMOVE: sofas, chairs, tables, beds, desks, shelving units, floor lamps, table lamps, rugs, cushions, throws, curtains, blinds, artwork, wall art, plants, decorative objects, electronics, cables, and any other non-fixed items.
- REMOVE: all items sitting on countertops, shelves, and surfaces — including vases, bowls, bottles, small appliances, utensils, and any decorative objects resting on surfaces. Leave surfaces completely bare.
- KEEP: bare walls, bare floors, ceiling, windows (with natural light passing through), doors, and all permanently fixed architectural elements.
- KEEP: permanently built-in appliances only (built-in oven, hob, extractor hood). Do NOT add any new furniture, plants, or decorative items.

FLOOR & WALLS:
- Where furniture or rugs covered the floor, reveal the continuous floor surface underneath in a matching material and texture.
- Where objects were against walls, show clean, uninterrupted bare wall surface.

LIGHTING:
- Maintain natural light entering through windows. Preserve the time-of-day and light direction from the original photo.
- REMOVE: all pendant lights, chandeliers, floor lamps, table lamps, and any hanging or portable lighting fixtures.
- KEEP: only flush-mounted or fully recessed ceiling lights that sit flat against the ceiling.

FINISH: The result should look like a professionally photographed empty room — freshly cleared, bright and photorealistic, ready for new furniture planning. No watermarks.
`.trim();
}
