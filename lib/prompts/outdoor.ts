const outdoorStyles: Record<string, string> = {
  Mediterranean: "terracotta or limestone paving, whitewashed stone walls, olive and cypress trees, wooden pergola draped with climbing vines, large terracotta pots with lavender and rosemary, wrought-iron furniture with cushions, warm earthy tones throughout",
  Japanese:      "raked zen gravel with stone arrangements, koi pond or water basin, bamboo screen fencing, stone lanterns and stepping-stone path, bonsai and maple trees, minimalist wooden deck, moss ground cover, calm and serene atmosphere",
  Tropical:      "lush oversized palm trees and banana leaf plants, natural stone or timber decking, infinity-edge pool or water feature, rattan and teak outdoor furniture, string lights and torch lighting, vibrant flowering plants, rich green canopy overhead",
  Cottage:       "colourful wildflower beds and climbing roses on trellises, irregular stone or brick path, white picket or low hedgerow border, rustic wooden bench, herb and vegetable garden corner, soft dappled natural lighting, quaint and lush feel",
  Modern:        "large-format concrete or porcelain paving in neutral tones, geometric lawn panels, architectural ornamental grasses and box hedges, minimalist steel-frame pergola, sleek low-profile outdoor furniture, recessed path lighting, clean lines throughout",
  Desert:        "decomposed granite or sandy gravel ground, clusters of cacti and succulent arrangements, natural sandstone boulders, drought-resistant agave and yucca plants, low adobe or rammed-earth walls, warm terracotta and sand tones, minimal water use",
};

export function buildOutdoorPrompt(style: string, customPrompt?: string): string {
  const detail = outdoorStyles[style] ?? `materials, plants, furniture and lighting typical of ${style} landscape design`;

  let prompt = `
USE THE PROVIDED PHOTO AS THE EXACT STRUCTURAL BASE.

GLOBAL RULES — DO NOT VIOLATE UNDER ANY CIRCUMSTANCES:
1) Keep the exact same camera angle and perspective — do not rotate, zoom or shift the viewpoint.
2) Keep all boundary walls, fences, permanent built structures, pergolas, decking and hardscape in their exact position and proportion.
3) Do not change the size or shape of the outdoor space or alter any permanent structural element.
4) Preserve the spatial layout — existing large trees, mature shrubs, pools, patios and fixed landscape features must remain in their positions. Replace or adapt their appearance to match the style; do not remove or relocate them.
5) Replace or adapt existing plants, ground cover and movable furniture to match the target style — do not pile new elements on top of existing ones.
6) No text, labels or watermarks in the output.
7) LIGHTING: Always render in bright natural daylight with clear sky. Never inherit a dark, overcast or gloomy mood from the input photo.

REDESIGN WITH ${style.toUpperCase()} OUTDOOR AESTHETIC:
Use the following specific elements: ${detail}.

- Ground: Replace existing ground cover, paving or decking with the style-appropriate material above.
- Plants: Replace or adapt existing plants and add style-appropriate trees, shrubs and ground cover exactly as described. Respect existing planting positions.
- Furniture: Replace existing outdoor furniture with pieces that fit the style. Keep furniture in approximately the same area as the original.
- Lighting: Replace or adapt lighting fixtures with appropriate outdoor lighting — path lights, lanterns, string lights, etc.
- Decor: Replace or adapt water features, planters or decorative elements to be consistent with the style.

Apply the style clearly and professionally, as if the space was redesigned by a landscape architect. The outdoor space must remain recognisably the same garden — same boundaries, same proportions, same layout — with the style transformed.

FINISH: Photorealistic output. Professional landscape photography quality. Natural daylight lighting. No watermarks.
`.trim();

  if (customPrompt?.trim()) {
    const sanitized = customPrompt.trim().replace(/<[^>]*>/g, "").slice(0, 1000);
    prompt += `\n\nADDITIONAL USER REQUIREMENTS:\n${sanitized}\nThese requirements take priority over default style guidelines where they conflict.`;
  }

  return prompt;
}
