interface BrandIdentity {
  primary_colors?: string[]
  style?: string
  mood?: string
  image_style_recommendation?: string
  color_palette_description?: string
  brand_personality?: string
}

export function buildImagePrompt(
  campaign: object,
  headline: string,
  subheadline: string,
  cta: string,
  platform: string,
  format: string,
  tone: string,
  brandIdentity?: BrandIdentity,
  logoUrl?: string
): string {
  const dimensions: Record<string, string> = {
    instagram_post: '1:1', instagram_story: '9:16', instagram_reel: '9:16',
    facebook_post: '1.91:1', tiktok: '9:16', linkedin: '1.91:1', default: '1:1',
  }
  const dim = dimensions[`${platform}_${format}`] || dimensions.default

  const brandSection = brandIdentity ? `
IDENTIDAD VISUAL DE LA MARCA:
- Colores primarios: ${brandIdentity.primary_colors?.join(', ') ?? 'no definidos'}
- Estilo visual: ${brandIdentity.style ?? 'moderno'}
- Mood: ${brandIdentity.mood ?? 'profesional'}
- Personalidad: ${brandIdentity.brand_personality ?? ''}
- Instrucciones de estilo: ${brandIdentity.image_style_recommendation ?? ''}
- Paleta de colores: ${brandIdentity.color_palette_description ?? ''}
${logoUrl ? `- IMPORTANTE: La imagen debe ser consistente con la identidad visual del logo de la marca. Usa los colores exactos de la marca.` : ''}
` : ''

  return `Eres un director de arte especializado en publicidad digital premium. Creas imágenes que parecen de una agencia de nivel internacional.

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}
${brandSection}
TEXTOS DEL ANUNCIO:
- Titular: "${headline}"
- Secundario: "${subheadline}"
- CTA: "${cta}"

PLATAFORMA: ${platform} | FORMATO: ${format} | TONO: ${tone} | DIMENSIONES: ${dim}

PRINCIPIOS: iluminación cinematográfica, composición limpia, alto impacto visual, alta conversión, colores de la marca.

Devuelve ÚNICAMENTE JSON válido:
{
  "image_prompt": "prompt completo en inglés para generación de imagen (mínimo 80 palabras). DEBE incluir los colores específicos de la marca, el estilo visual definido, y ser altamente descriptivo sobre la composición, iluminación y ambiente",
  "negative_prompt": "no text, no watermarks, no generic stock photo look, no busy backgrounds",
  "style": "descripción del estilo en 1 línea",
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "dimensions": "${dim}",
  "text_overlay": {
    "main_text": "${headline}",
    "secondary_text": "${subheadline}",
    "cta_text": "${cta}",
    "font_recommendation": "fuente y peso recomendado",
    "text_placement": "top|center|bottom|overlay",
    "text_color": "#ffffff"
  },
  "art_director_notes": "instrucciones adicionales para maximizar el impacto"
}`
}
