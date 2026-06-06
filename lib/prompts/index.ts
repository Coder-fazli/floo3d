import { PromptConfig } from "./types";                 
import { buildFloorPlanPrompt } from "./floor-plan";    
import { buildInteriorDesignPrompt } from "./interior-design";
import { buildOutdoorPrompt } from "./outdoor";         
import { buildEmptyRoomPrompt } from "./empty-room"; 
import { buildVirtualStagingPrompt } from "./virtual-staging";

function appendCustomPrompt(prompt: string, customPrompt?: string): string {
    if (!customPrompt?.trim()) return prompt;
    const sanitized = customPrompt.trim().replace(/<[^>]*>/g, "").slice(0, 1000);
    return `${prompt}\n\nADDITIONAL USER REQUIREMENTS:\n${sanitized}\nThese requirements take priority over default style guidelines where they conflict.`;
}

export function buildPrompt(config: PromptConfig): string {
    const { inputType, style, roomType, viewAngle, customPrompt } = config;

    if (inputType === "interior-design") return buildInteriorDesignPrompt(style, roomType, customPrompt);
    if (inputType === "outdoor") return buildOutdoorPrompt(style, customPrompt);
    if (inputType === "empty-room") return buildEmptyRoomPrompt();
    if (inputType === "virtual-staging") return buildVirtualStagingPrompt(style, roomType, customPrompt);

    return appendCustomPrompt(buildFloorPlanPrompt(style, viewAngle), customPrompt);
}