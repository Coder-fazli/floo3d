export interface PromptConfig {
    inputType: string;
    style: string;
    roomType?: string;
    viewAngle?: string;
    customPrompt?: string;
}

export interface StyleDef{
   rules: string;
   feel: string;
}