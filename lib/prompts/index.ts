import { PromptConfig } from "./types";                 
import { buildFloorPlanPrompt } from "./floor-plan";    
import { buildInteriorDesignPrompt } from "./interior-design";
import { buildOutdoorPrompt } from "./outdoor";         
import { buildEmptyRoomPrompt } from "./empty-room"; 

export function buildPrompt(config: PromptConfig): string {
    const { inputType, style, roomType, viewAngle } = config;

    if ( inputType === "interior-design" ) return buildInteriorDesignPrompt(style, roomType);
    if (inputType === "outdoor") return buildOutdoorPrompt(style);
    if (inputType === "empty-room") return buildEmptyRoomPrompt();

    return buildFloorPlanPrompt(style, viewAngle);
}