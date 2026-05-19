export function buildImagePrompt(campaign: object, headline: string, subheadline: string, cta: string, platform: string, format: string, tone: string): string {
  const dimensions: Record<string, string> = {
    instagram_post: '1:1',
    instagram_story: '9:16',
    instagram_reel: '9:16',
    facebook_post: '1.91:1',
    tiktok: '9:16',
    linkedin: '1.91:1',
    default: '1:1',
  }

  const dim = dimensions[`${platform}_${format}`] || dimensions.default

  return `Eres un director de arte especializado en publicidad digital premium. Tu trabajo es construir prompts de imagen que resulten en creatividades de nivel agencia top (TBWA, Wieden+Kennedy, Ogilvy).

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}

TEXTOS A INCLUIR:
- Titular: "${headline}"
- Secundario: "${subheadline}"
- CTA: "${cta}"
PLATAFORMA: ${platform}
FORMATO: ${format}
TONO VISUAL: ${tone}
DIMENSIONES: ${dim}

Construye el prompt de imagen ideal para DALL-E 3. El resultado debe parecer una campaña de agencia premium, NO stock photography genérica.

PRINCIPIOS: iluminación cinematográfica, composición limpia, pocos elementos mucho impacto, alta conversión visual.

Devuelve ÚNICAMENTE JSON válido:
{
  "image_prompt": "prompt completo y detallado para DALL-E 3 en inglés (mínimo 100 palabras, máximo 200)",
  "negative_prompt": "qué evitar: no text watermarks, no busy backgrounds, no stock photo look, no generic imagery",
  "style": "descripción del estilo visual en 1 línea",
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "dimensions": "${dim}",
  "text_overlay": {
    "main_text": "${headline}",
    "secondary_text": "${subheadline}",
    "cta_text": "${cta}",
    "font_recommendation": "nombre de fuente y peso",
    "text_placement": "top | center | bottom | overlay",
    "text_color": "#ffffff"
  },
  "art_director_notes": "instrucciones adicionales de dirección de arte"
}`
}
