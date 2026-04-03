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
  style: "blueprint" | "colored" | "isometric";
}

const stylePrompts = {
    blueprint: "Clean black and white architectural blueprint style. Thin precise lines, room labels, standard architectural symbols for doors and windows. White background.",
    colored: "Top-down 2D floor plan with colored rooms. Each room filled with a soft distinct color. Furniture icons shown as simple flat shapes. Clean and readable.",
    isometric: "Isometric 3D floor plan view from a corner angle. Photorealistic furniture and materials. Open top showing all rooms. White background.",
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

  return `Generate a 2D floor plan for a ${floors}-floor ${propertyType} of ${area} ${areaUnit}.\n\nRooms: ${roomList}\n\n${stylePrompts[style]}`;
}