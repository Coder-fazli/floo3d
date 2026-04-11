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
    blueprint: "Clean architectural blueprint style. White lines on a dark blue background, or black lines on white — precise and technical. Thin walls shown as double lines with correct thickness. Standard architectural symbols for doors (swing arc), windows (three parallel lines on wall), stairs. Room labels in clean sans-serif text. North arrow in corner. No furniture detail — only fixed elements. No decorative elements, no color fills, no gradients.",
    colored: "Top-down 2D floor plan with flat colored rooms. Each room filled with a distinct soft pastel color — living room in warm beige, bedrooms in soft blue, kitchen in light yellow, bathrooms in light teal, other rooms in muted grey or green. Walls are thick solid dark lines. Furniture shown as simple flat 2D icons in a slightly darker shade of the room color. Doors shown as thin arcs. Clean, readable, no gradients, no shadows, no 3D effect.",
    isometric: "Isometric 3D dollhouse render from a fixed corner angle — camera at 45 degrees looking down at the front corner. Roof removed to show all interior rooms. Walls have visible height and thickness. Realistic furniture and materials inside each room. Consistent lighting from above-left. White or light grey background. No text, no labels, no annotations.",
    "3d top-down": "Photorealistic 3D render with camera mounted directly overhead at 90 degrees — zero tilt, zero perspective angle. The view is purely flat like a map but rendered in 3D with realistic materials. Ceiling removed to show interior. Realistic furniture, floor materials, lighting and soft shadows visible from above. High-detail render. No text, no labels, no watermarks.",
}

export function buildFloorPlanGeneratorPrompt(config:FloorPlanGeneratorConfig) : string {
    const { propertyType, area, areaUnit, floors, rooms, extras,
  style  } = config; 

  const roomList = [
    rooms.bedroom > 0 && `${rooms.bedroom} Bedroom${rooms.bedroom > 1 ? "s" : ""}`, 
    rooms.bathroom > 0 && `${rooms.bathroom} Bathroom${rooms.bathroom > 1 ? "s" : ""}`, 
    rooms.kitchen > 0 && `${rooms.kitchen} Kitchen`, 
    rooms.livingRoom > 0 && `${rooms.livingRoom} Living Room`, 
    rooms.diningRoom > 0 && `${rooms.diningRoom} Dining Room`, 
    rooms.office > 0 && `${rooms.office} Office`, 
    extras.garage && "Garage", 
    extras.balcony && "Balcony", 
    extras.terrace && "Terrace", 
    extras.garden && "Garden area"
  ].filter(Boolean).join(", ");

  const floorNote = floors > 1
    ? `Show the ground floor plan only. Label it clearly as "Ground Floor". Do not stack multiple floors in one image.`
    : `Single floor plan.`;

  return `Generate an accurate architectural floor plan for the following property.

PROPERTY: ${floors}-floor ${propertyType}, total area ${area} ${areaUnit}
ROOMS: ${roomList}

STRICT RULES — DO NOT VIOLATE:
1) Scale rooms proportionally to the total area of ${area} ${areaUnit}. A ${area} ${areaUnit} property must not look like a mansion or a studio — match realistic proportions.
2) Every room listed must appear exactly once. Do not add extra rooms, storage rooms, hallways or spaces not listed.
3) Walls must have consistent thickness throughout. Doors and windows must be placed on walls only — never floating.
4) Bathrooms must contain only bathroom fixtures. Kitchens must contain only kitchen fixtures. Do not mix furniture across rooms.
5) ${floorNote}
6) Extras if present: ${extras.garage ? "Garage attached to the building." : ""} ${extras.balcony ? "Balcony accessible from a main room." : ""} ${extras.terrace ? "Terrace shown as an outdoor area connected to the building." : ""} ${extras.garden ? "Garden shown as a clearly bounded outdoor area adjacent to the building — sized proportionally, not larger than the building footprint." : ""}
7) No text inside rooms other than room name labels. No dimensions, no north arrow unless the style requires it. No decorative borders.

${stylePrompts[style]}`;
}