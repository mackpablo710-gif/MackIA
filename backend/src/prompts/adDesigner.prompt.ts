export function buildAdDesignPrompt(
  campaign: object,
  headline: string,
  subheadline: string,
  cta: string,
  platform: string,
  format: string,
  tone: string,
  visualStyle: string,
  brandIdentity?: {
    primary_colors?: string[]
    style?: string
    mood?: string
    brand_personality?: string
  },
  brandName?: string,
  brandTagline?: string
): string {
  const accentFromBrand = brandIdentity?.primary_colors?.[0] ?? null

  // Dimension mapping
  const dimMap: Record<string, string> = {
    instagram_post: '4:5', instagram_story: '9:16', instagram_reel: '9:16',
    instagram_carrusel: '4:5', tiktok_post: '9:16', tiktok_reel: '9:16',
    tiktok_story: '9:16', linkedin_post: '16:9', linkedin_story: '9:16',
    facebook_post: '1:1', facebook_story: '9:16', facebook_reel: '9:16',
  }
  const dimKey = `${platform}_${format}`.toLowerCase()
  const dimensions = dimMap[dimKey] ?? '1:1'

  // Style → template mapping
  const templateSuggestion =
    ['corporativo', 'elegante', 'premium', 'lujo'].includes(visualStyle) ? 'editorial-split' :
    ['minimalista', 'agresivo', 'startup', 'tiktok_viral'].includes(visualStyle) ? 'bold-minimal' :
    'dark-power'

  return `Eres el Director de Arte de la agencia de publicidad digital más premiada de Latinoamérica.
Tu trabajo: diseñar la ESPECIFICACIÓN EXACTA de una pieza publicitaria de alta conversión.

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}

TEXTOS DEL ANUNCIO:
- Titular: "${headline}"
- Subtítulo: "${subheadline}"
- CTA: "${cta}"

MARCA: ${brandName ?? 'la marca'}
TAGLINE: ${brandTagline ?? ''}
COLOR DE MARCA: ${accentFromBrand ?? 'elige el mejor para el tono'}
PLATAFORMA: ${platform} | FORMATO: ${format} | TONO: ${tone}
ESTILO VISUAL: ${visualStyle}

TEMPLATE RECOMENDADO: ${templateSuggestion}
DIMENSIONES: ${dimensions}

Genera la especificación completa del diseño publicitario. Los features deben ser BENEFICIOS REALES del producto, no genéricos. Los iconos deben ser emojis relevantes al sector.

Regla de oro: el diseño debe funcionar en 0.3 segundos. El headline PARA el scroll. El CTA convierte.

Devuelve ÚNICAMENTE JSON válido:
{
  "template": "${templateSuggestion}",
  "dimensions": "${dimensions}",
  "headline": "titular impactante (puede ser diferente al sugerido si mejora el impacto)",
  "subheadline": "subtítulo que profundiza",
  "cta": "CTA específico y accionable",
  "hook": "frase corta para badge de urgencia/contexto (máx 5 palabras, ej: '¿Enviaste 100 CVs sin respuesta?')",
  "accentColor": "${accentFromBrand ?? '#8b5cf6'}",
  "brandName": "${brandName ?? ''}",
  "brandTagline": "${brandTagline ?? ''}",
  "features": [
    { "icon": "emoji", "title": "Beneficio concreto", "desc": "Descripción en máx 8 palabras" },
    { "icon": "emoji", "title": "Beneficio concreto 2", "desc": "Descripción en máx 8 palabras" },
    { "icon": "emoji", "title": "Beneficio concreto 3", "desc": "Descripción en máx 8 palabras" }
  ],
  "art_director_notes": "Por qué este diseño convierte — en 1 oración"
}`
}
