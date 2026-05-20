interface BrandIdentity {
  primary_colors?: string[]
  secondary_colors?: string[]
  style?: string
  mood?: string
  image_style_recommendation?: string
  color_palette_description?: string
  brand_personality?: string
}

// Exact pixel dimensions per platform/format
const PLATFORM_DIMENSIONS: Record<string, { pixels: string; ratio: string; label: string }> = {
  'instagram_post':   { pixels: '1080x1350', ratio: '4:5',   label: 'Instagram Feed' },
  'instagram_story':  { pixels: '1080x1920', ratio: '9:16',  label: 'Instagram Story' },
  'instagram_reel':   { pixels: '1080x1920', ratio: '9:16',  label: 'Instagram Reel' },
  'instagram_carrusel': { pixels: '1080x1350', ratio: '4:5', label: 'Instagram Carrusel' },
  'tiktok_post':      { pixels: '1080x1920', ratio: '9:16',  label: 'TikTok' },
  'tiktok_reel':      { pixels: '1080x1920', ratio: '9:16',  label: 'TikTok' },
  'tiktok_story':     { pixels: '1080x1920', ratio: '9:16',  label: 'TikTok' },
  'linkedin_post':    { pixels: '1200x627',  ratio: '1.91:1','label': 'LinkedIn Feed' },
  'linkedin_story':   { pixels: '1080x1920', ratio: '9:16',  label: 'LinkedIn Story' },
  'facebook_post':    { pixels: '1080x1080', ratio: '1:1',   label: 'Facebook Ads' },
  'facebook_story':   { pixels: '1080x1920', ratio: '9:16',  label: 'Facebook Story' },
  'facebook_reel':    { pixels: '1080x1920', ratio: '9:16',  label: 'Facebook Reel' },
}

function getDimensions(platform: string, format: string) {
  const key = `${platform}_${format}`.toLowerCase()
  return PLATFORM_DIMENSIONS[key] ?? { pixels: '1080x1080', ratio: '1:1', label: `${platform} ${format}` }
}

// Visual style descriptors
const STYLE_MODIFIERS: Record<string, string> = {
  corporativo:   'clean corporate aesthetic, professional business photography, navy and white palette, executive setting, premium office environment',
  startup:       'bold modern startup branding, vibrant gradients, energetic composition, tech-forward feel, clean san-serif typography overlay areas',
  lujo:          'luxury brand photography, dark rich backgrounds, gold accents, shallow depth of field, editorial magazine quality, aspirational lifestyle',
  minimalista:   'extreme minimalism, vast negative space, single focal point, limited color palette, clean geometric composition',
  agresivo:      'high contrast, bold typography-dominant, dramatic lighting, strong shadows, kinetic energy, disruptive visual pattern',
  emocional:     'warm cinematic lighting, authentic human moments, genuine emotion, storytelling composition, golden hour palette',
  moderno:       'contemporary design aesthetic, bold colors, dynamic composition, modern geometric elements, strong visual hierarchy',
  tecnológico:   'tech-forward visual language, digital interface elements, neon accents on dark background, data visualization aesthetic, futuristic',
  tiktok_viral:  'vertical format, raw authentic UGC feel, bright saturated colors, text overlays, dynamic crop, relatable scenario',
  elegante:      'sophisticated restraint, muted premium palette, graceful composition, fine detail, understated luxury',
  premium:       'world-class advertising production value, cinematic grade, aspirational setting, perfect lighting, flawless execution',
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
  logoUrl?: string,
  visualStyle?: string
): string {
  const dim = getDimensions(platform, format)
  const styleKey = (visualStyle ?? tone ?? 'moderno').toLowerCase().replace(/\s+/g, '_')
  const styleDesc = STYLE_MODIFIERS[styleKey] ?? STYLE_MODIFIERS.moderno

  const brandSection = brandIdentity ? `
IDENTIDAD VISUAL DE LA MARCA:
- Colores primarios: ${brandIdentity.primary_colors?.join(', ') ?? 'no definidos'}
- Colores secundarios: ${brandIdentity.secondary_colors?.join(', ') ?? ''}
- Estilo visual: ${brandIdentity.style ?? 'moderno'}
- Mood: ${brandIdentity.mood ?? 'profesional'}
- Personalidad de marca: ${brandIdentity.brand_personality ?? ''}
- Recomendación de estilo IA: ${brandIdentity.image_style_recommendation ?? ''}
- Paleta: ${brandIdentity.color_palette_description ?? ''}
${logoUrl ? '- INTEGRAR: Logo de la marca presente de forma natural en la composición — esquina inferior o elemento de la escena. NO pegado grande arriba.' : ''}
` : ''

  const campaignData = campaign as Record<string, unknown>

  return `Eres el Director de Arte de la agencia de publicidad digital más premiada del mundo. Tus piezas aparecen en Cannes Lions, Clio Awards y D&AD. Pero más importante: CONVIERTEN.

TU FILOSOFÍA:
Antes de generar CUALQUIER imagen, piensas en:
1. ¿Qué DOLOR ataca esta pieza?
2. ¿Qué EMOCIÓN activa en los primeros 0.3 segundos?
3. ¿Qué PATRÓN INTERRUMPE para detener el scroll?
4. ¿Cómo se lee la JERARQUÍA en 1 segundo?
5. ¿El CTA está donde el ojo llega naturalmente?

REGLA ABSOLUTA: NO generas fondos bonitos. NO generas imágenes vacías. SIEMPRE construyes una PIEZA PUBLICITARIA COMPLETA con concepto, jerarquía, mensaje y acción.

CAMPAÑA:
- Título: ${campaignData.title ?? ''}
- Concepto: ${campaignData.concept ?? ''}
- Arquetipo: ${campaignData.archetype ?? ''}
- Hook: ${campaignData.hook ?? ''}
- Ángulo: ${campaignData.angle ?? ''}
- Emoción: ${campaignData.emotion ?? ''}
- Concepto visual: ${JSON.stringify(campaignData.visual_concept ?? {})}
${brandSection}
TEXTOS DEL ANUNCIO:
- TITULAR PRINCIPAL: "${headline}"
- SUBTÍTULO: "${subheadline}"
- CTA: "${cta}"

ESPECIFICACIONES TÉCNICAS:
- Plataforma: ${dim.label}
- Dimensiones: ${dim.pixels} px (ratio ${dim.ratio})
- Estilo visual solicitado: ${visualStyle ?? tone ?? 'moderno'}
- Descriptor de estilo: ${styleDesc}

CONSTRUYE EL PROMPT DE IMAGEN siguiendo esta estructura mental:

ESCENA: ¿Quién aparece? ¿Qué hace? ¿Dónde?
EMOCIÓN: ¿Qué siente el personaje? ¿Qué siente el espectador?
COMPOSICIÓN: ¿Dónde va el texto? ¿Dónde va el CTA? (deja espacio limpio para overlay de texto)
ILUMINACIÓN: ¿Qué lighting refuerza la emoción?
MARCA: ¿Cómo se integra el branding sin dominar?

Devuelve ÚNICAMENTE JSON válido:
{
  "image_prompt": "prompt completo en inglés para FLUX/Stable Diffusion (mínimo 100 palabras). DEBE incluir: escena específica con personaje y acción, composición cinematográfica, iluminación, colores de marca, área limpia para texto en zona ${dim.ratio === '9:16' ? 'inferior' : 'lateral o inferior'}, calidad de producción publicitaria. SIN texto en la imagen generada — el texto va en overlay. Ejemplo de nivel de detalle requerido: 'A frustrated professional sitting at a modern desk, laptop screen showing multiple email rejection messages glowing red, cinematic low-key lighting with blue-purple tones, dark background, photorealistic, advertising photography quality, clear lower third area for text overlay, 8k resolution, award-winning advertising campaign'",
  "negative_prompt": "text, words, letters, watermark, logo, generic stock photo, amateur, blurry, distorted, low quality, busy cluttered background, no clear focal point, multiple subjects fighting for attention",
  "style": "descripción del estilo en 1 línea",
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "dimensions": "${dim.ratio}",
  "pixels": "${dim.pixels}",
  "text_overlay": {
    "main_text": "${headline}",
    "secondary_text": "${subheadline}",
    "cta_text": "${cta}",
    "font_recommendation": "fuente específica y peso (ej: Helvetica Neue Bold para headline)",
    "text_placement": "descripción exacta de posición del texto en la imagen",
    "text_color": "#ffffff",
    "background_for_text": "si necesita área oscurecida para leer el texto"
  },
  "composition_notes": "jerarquía visual detallada: dónde va cada elemento, zonas seguras, punto focal",
  "art_director_notes": "por qué esta composición maximiza el CTR y la conversión para ${dim.label}"
}`
}
