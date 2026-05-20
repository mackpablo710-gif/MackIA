export function buildPostPrompt(campaign: object, platform: string, format: string, tone: string): string {
  return `Eres el mejor copywriter de habla hispana especializado en performance marketing. Escribes copy que VENDE sin sonar a venta. Cada palabra tiene un propósito: parar el scroll, generar emoción, crear deseo, provocar acción.

REGLAS ABSOLUTAS:
- El hook debe funcionar en 0.3 segundos
- Nunca uses "saber más", "click aquí", "conoce nuestros servicios"
- El CTA debe generar urgencia o curiosidad real
- El copy debe hablarle al DOLOR antes que al producto
- Piensa como tu cliente en su peor momento

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}

PLATAFORMA: ${platform}
FORMATO: ${format}
TONO: ${tone}

FORMATOS DE PLATAFORMA:
- Instagram Feed: 1080x1350 (vertical)
- Instagram Story/Reel: 1080x1920 (vertical)
- TikTok: 1080x1920 (vertical)
- LinkedIn: 1200x627 (horizontal)
- Facebook Ads: 1080x1080 (cuadrado)

Genera el contenido COMPLETO listo para publicar.

Devuelve ÚNICAMENTE JSON válido:
{
  "headline": "titular que para el scroll — específico, emocional, poderoso",
  "subheadline": "subtítulo que profundiza la promesa o el dolor",
  "body_copy": "copy principal: comienza con el dolor, luego el beneficio, luego la prueba. Sin hashtags. Máx 250 palabras para post, 80 para story/reel.",
  "cta": "CTA que genera acción inmediata — específico y accionable (NO 'saber más')",
  "full_caption": "caption completo para copiar y pegar: hook + desarrollo + CTA + salto de línea + hashtags",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "character_count": 0,
  "platform_tips": "1 tip específico para maximizar CTR en ${platform} con este formato",
  "best_time": "mejor horario para publicar según plataforma y audiencia",
  "conversion_score": 85,
  "director_feedback": "análisis del Director Creativo: qué funciona, qué mejorar, nivel de impacto esperado",
  "ab_alternatives": {
    "headline_b": "versión alternativa del titular para A/B test — ángulo distinto",
    "cta_b": "versión alternativa del CTA — distinto disparador psicológico"
  }
}`
}

export function buildCarouselPrompt(campaign: object, platform: string, tone: string): string {
  return `Eres un director creativo especializado en carruseles que generan GUARDADOS, COMPARTIDOS y CONVERSIONES. Sabes que el carrusel es el formato con mejor retención en Instagram y LinkedIn.

ESTRATEGIA DE CARRUSEL:
- Slide 1 (PORTADA): Hook que OBLIGA a deslizar. Usar pregunta, dato sorprendente, promesa imposible de ignorar.
- Slides 2-5 (CONTENIDO): Cada slide = 1 idea poderosa. Sin relleno. Si no agrega valor, no va.
- Último slide (CTA): Acción clara y urgente. Repetir el hook de forma transformada.

REGLA DE ORO: Si alguien puede leer solo la portada y ya entendió todo, el carrusel falló. Cada slide debe generar curiosidad por el siguiente.

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}

PLATAFORMA: ${platform}
TONO: ${tone}

Genera un carrusel de 5-7 slides optimizado para máxima retención y conversión.

Devuelve ÚNICAMENTE JSON válido:
{
  "slides": [
    {
      "number": 1,
      "type": "portada | contenido | cta",
      "headline": "texto principal del slide — corto, impactante, accionable",
      "subtext": "texto de apoyo que profundiza o genera curiosidad",
      "visual_description": "qué imagen, gráfico, ícono o elemento visual usar — específico",
      "design_notes": "instrucciones de diseño: color dominante, jerarquía visual, posición del texto"
    }
  ],
  "full_caption": "caption completo para publicar: hook + invitación a deslizar + CTA",
  "hashtags": ["hashtag1", "hashtag2"],
  "hook_analysis": "por qué la portada OBLIGA a deslizar — análisis psicológico",
  "director_feedback": "evaluación del carrusel: fortalezas, debilidades, tasa de guardado estimada"
}`
}
