export function buildPostPrompt(campaign: object, platform: string, format: string, tone: string): string {
  return `Eres el mejor copywriter de habla hispana. Especialidad: copy que vende sin sonar a venta. Conoces los algoritmos de cada red social.

CAMPAÑA SELECCIONADA:
${JSON.stringify(campaign, null, 2)}

PLATAFORMA: ${platform}
FORMATO: ${format}
TONO: ${tone}

Genera el contenido completo listo para publicar.

Devuelve ÚNICAMENTE JSON válido:
{
  "headline": "titular principal",
  "subheadline": "subtítulo",
  "body_copy": "texto principal sin hashtags (máximo 300 palabras para post, 150 para story)",
  "cta": "llamada a la acción específica y accionable (NO 'saber más' o 'click aquí')",
  "full_caption": "caption completo listo para copiar y pegar incluyendo emojis estratégicos",
  "hashtags": ["hashtag1", "hashtag2"],
  "character_count": 0,
  "platform_tips": "consejo específico para maximizar alcance en ${platform}",
  "best_time": "mejor horario para publicar",
  "conversion_score": 85,
  "director_feedback": "crítica honesta del director creativo — qué funciona y qué mejorar",
  "ab_alternatives": {
    "headline_b": "versión alternativa del titular para A/B test",
    "cta_b": "versión alternativa del CTA"
  }
}`
}

export function buildCarouselPrompt(campaign: object, platform: string, tone: string): string {
  return `Eres un director creativo especializado en carruseles virales que generan guardados y compartidos.

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}

PLATAFORMA: ${platform}
TONO: ${tone}

Genera un carrusel de 5-7 slides optimizado para máxima retención y guardados.

Devuelve ÚNICAMENTE JSON válido:
{
  "slides": [
    {
      "number": 1,
      "type": "portada | contenido | cta",
      "headline": "texto principal del slide",
      "subtext": "texto secundario o detalle",
      "visual_description": "descripción de qué imagen/gráfico usar",
      "design_notes": "instrucciones de diseño específicas"
    }
  ],
  "full_caption": "caption completo para el carrusel",
  "hashtags": ["hashtag1"],
  "hook_analysis": "por qué la portada va a detener el scroll",
  "director_feedback": "crítica y mejoras sugeridas"
}`
}
