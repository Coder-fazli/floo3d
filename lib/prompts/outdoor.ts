const outdoorStyles: Record<string, string> = {
    Mediterranean: "terracotta or limestone paving, whitewashed stone walls, olive and cypress trees, wooden pergola draped with climbing vines, large terracotta pots with lavender and rosemary, wrought-iron furniture with cushions, warm earthy tones throughout",
    Japanese: "raked zen gravel with stone arrangements, koi pond or water basin, bamboo screen fencing, stone lanterns and stepping-stone path, bonsai and maple trees, minimalist wooden deck, moss ground cover, calm and serene atmosphere",
    Tropical: "lush oversized palm trees and banana leaf plants, natural stone or timber decking, infinity-edge pool or water feature, rattan and teak outdoor furniture, string lights and torch lighting, vibrant flowering plants, rich green canopy overhead",
    Cottage: "colourful wildflower beds and climbing roses on trellises, irregular stone or brick path, white picket or low hedgerow border, rustic wooden bench, herb and vegetable garden corner, soft dappled natural lighting, quaint and lush feel",
    Modern: "large-format concrete or porcelain paving in neutral tones, geometric lawn panels, architectural ornamental grasses and box hedges, minimalist steel-frame pergola, sleek low-profile outdoor furniture, recessed path lighting, clean lines throughout",
    Desert: "decomposed granite or sandy gravel ground, clusters of cacti and succulent arrangements, natural sandstone boulders, drought-resistant agave and yucca plants, low adobe or rammed-earth walls, warm terracotta and sand tones, minimal water use",
}

export function buildOutdoorPrompt(style: string): string {
    const detail = outdoorStyles[style] ?? `materials,    
  plants, furniture and lighting typical of ${style}      
  landscape design`;
                                                          
    return `                                            
  USE THE PROVIDED PHOTO AS THE EXACT STRUCTURAL BASE.
                                                          
  GLOBAL RULES — DO NOT VIOLATE:
  1) Keep the exact same camera angle and perspective.    
  2) Keep all boundary walls, fences and permanent built  
  structures in exact position.                           
  3) Do not change the size or shape of the outdoor space.
  4) No text, labels or watermarks in the output.         
                                                          
  REDESIGN WITH ${style.toUpperCase()} OUTDOOR AESTHETIC: 
  Use the following specific elements: ${detail}.         
                                                          
  - Ground: Replace with ground cover, paving or decking  
  matching the style above.
  - Plants: Add realistic plants, trees and shrubs exactly
   as described.                                          
  - Furniture: Add outdoor seating and dining pieces that 
  fit the style.                                          
  - Lighting: Add appropriate outdoor lighting — path   
  lights, lanterns, string lights, etc.                   
  - Decor: Add water features, planters or decorative   
  elements consistent with the style.                     
                                                        
  Apply the style strongly but realistically, as if       
  professionally landscaped.                            
                                                          
  FINISH: Photorealistic output. Professional landscape   
  photography quality. Natural daylight lighting. No 
  watermarks.                                             
    `.trim();                            
}