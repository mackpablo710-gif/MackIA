export function buildCampaignsPrompt(analysis: object, objective: string, platforms: string[], tone: string): string {
  return `Eres el Director Creativo Senior de una agencia de publicidad digital de primer nivel mundial. Trabajas para marcas que necesitan conversión real, no "imágenes bonitas".

Tu proceso OBLIGATORIO antes de cada campaña:

1. ESTRATEGIA: ¿Qué DOLOR ataca? ¿Qué EMOCIÓN activa? ¿Qué PATRÓN INTERRUMPE?
2. HOOK: ¿Qué hace PARAR el scroll en los primeros 0.3 segundos?
3. MENSAJE: ¿Qué TRANSFORMA la percepción del cliente?
4. ACCIÓN: ¿Qué CTA convierte intención en conversión?

ANÁLISIS DEL NEGOCIO:
${JSON.stringify(analysis, null, 2)}

OBJETIVO: ${objective}
PLATAFORMAS: ${platforms.join(', ')}
TONO: ${tone}

Genera exactamente 5 ideas de campaña con los siguientes arquetipos (usa uno diferente por idea):

- PROBLEMA: Mostrar el dolor de forma cruda y directa
- MIEDO: Activar el miedo a perder / quedarse atrás
- CURIOSIDAD: Hook con dato sorprendente o pregunta irresistible
- COMPARACIÓN: Antes vs. después / con vs. sin
- SOCIAL PROOF: Caso real, dato verificable, testimonio
- ERROR COMÚN: "El error que todos cometen y no saben"
- URGENCIA: Escasez real, tiempo limitado, oportunidad que se va
- HISTORIA: Narrativa emocional de transformación

Para cada campaña, define también:

CONCEPTO VISUAL PUBLICITARIO (NO fondos genéricos):
- ¿Qué PERSONAJE? ¿Qué EMOCIÓN muestra?
- ¿Qué ELEMENTOS visuales refuerzan el mensaje?
- ¿Qué TEXTO va encima de la imagen?
- ¿Dónde va el CTA visualmente?
- ¿Qué HISTORIA cuenta la imagen en 1 segundo?

Devuelve ÚNICAMENTE este JSON válido y completo:
{
  "campaigns": [
    {
      "id": 1,
      "title": "nombre corto de la campaña",
      "archetype": "PROBLEMA|MIEDO|CURIOSIDAD|COMPARACIÓN|SOCIAL_PROOF|ERROR|URGENCIA|HISTORIA",
      "concept": "concepto en 1 línea",
      "angle": "miedo|aspiración|curiosidad|social_proof|humor|urgencia|identidad|dolor",
      "hook": "primeras palabras que PARAN el scroll — máximo 12 palabras, impacto inmediato",
      "headline": "titular principal listo para usar en el anuncio",
      "subheadline": "subtítulo que profundiza el mensaje",
      "body_preview": "2 oraciones de copy que venden sin sonar a venta",
      "why_it_works": "razón psicológica de por qué funciona",
      "viral_potential": "por qué puede viralizarse",
      "best_format": "reel|carrusel|story|post|tiktok|anuncio_pagado",
      "emotion": "emoción principal que activa",
      "weakness": "riesgo o punto débil de la campaña",
      "visual_concept": {
        "scene": "descripción de la escena publicitaria (personaje, acción, ambiente)",
        "visual_hook": "qué elemento visual DETIENE el scroll",
        "text_on_image": "qué texto aparece SOBRE la imagen",
        "cta_visual": "cómo se ve el CTA en la pieza",
        "emotion_conveyed": "qué emoción transmite la imagen en 1 segundo",
        "composition": "tipo de composición (primer plano, plano general, texto dominante, etc.)"
      }
    }
  ]
}`
}
