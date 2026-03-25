export function buildEmptyRoomPrompt(): string {
    return `                                              
  USE THE PROVIDED PHOTO AS THE EXACT STRUCTURAL BASE.    
                                                          
  GLOBAL RULES — DO NOT VIOLATE UNDER ANY CIRCUMSTANCES:
  1) Keep the exact same camera angle and perspective — do
   not rotate, zoom or shift the viewpoint.               
  2) Keep all walls, ceilings, floors, doors, windows and 
  architectural features exactly as they are.             
  3) Do not change the size or shape of the room.       
  4) Keep all fixed built-in elements in place — kitchen  
  units, bathroom fixtures (toilet, sink, bath/shower),   
  built-in wardrobes, fireplaces, staircases.             
  5) No text, labels or watermarks in the output.         
                                                        
  TASK — EMPTY THE ROOM:                                  
  Remove every piece of movable furniture and decor from 
  the room:                                               
  - REMOVE: sofas, chairs, tables, beds, desks, shelving 
  units, floor lamps, table lamps, rugs, cushions, throws,
   curtains, blinds, artwork, wall art, plants, decorative
   objects, electronics, cables, and any other non-fixed  
  items.                                                
  - KEEP: bare walls, bare floors, ceiling, windows (with 
  natural light passing through), doors, and all          
  permanently fixed architectural elements.
                                                          
  FLOOR & WALLS:                                        
  - Where furniture or rugs covered the floor, reveal the 
  continuous floor surface underneath in a matching       
  material and texture.
  - Where objects were against walls, show clean,         
  uninterrupted bare wall surface.                        
  
  LIGHTING:                                               
  - Maintain natural light entering through windows.    
  Preserve the time-of-day and light direction from the   
  original photo.                                       
  - Remove all portable lighting. Keep ceiling-mounted or 
  recessed fixtures only if they were visible in the      
  original photo.
                                                          
  FINISH: The result should look like a professionally    
  photographed empty room — freshly cleared, bright and 
  photorealistic, ready for new furniture planning. No    
  watermarks.                                           
    `.trim();
}