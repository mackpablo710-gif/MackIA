export function buildCampaignsPrompt(analysis: object, objective: string, platforms: string[], tone: string): string {
  return `Eres un director creativo senior con 20 años de experiencia en campañas virales para startups.

ANÁLISIS DEL NEGOCIO:
${JSON.stringify(analysis, null, 2)}

OBJETIVO: ${objective}
PLATAFORMAS: ${platforms.join(', ')}
TONO: ${tone}

Genera exactamente 5 ideas de campaña únicas y poderosas. Sé conciso. NO incluyas textos de más de 2 oraciones por campo.

Devuelve ÚNICAMENTE este JSON válido y completo:
{
  "campaigns": [
    {
      "id": 1,
      "title": "nombre corto de la campaña",
      "concept": "concepto en 1 línea",
      "angle": "miedo|aspiración|curiosidad|social_proof|humor|urgencia|identidad",
      "hook": "primeras palabras que detienen el scroll (max 15 palabras)",
      "headline": "titular principal listo para usar",
      "subheadline": "subtítulo complementario",
      "body_preview": "2 oraciones de copy",
      "why_it_works": "razón estratégica en 1 oración",
      "viral_potential": "por qué puede volverse viral en 1 oración",
      "best_format": "reel|carrusel|story|post|tiktok|anuncio_pagado",
      "emotion": "emoción principal",
      "weakness": "riesgo principal en 1 oración"
    }
  ]
}`
}
