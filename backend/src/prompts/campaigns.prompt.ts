export function buildCampaignsPrompt(analysis: object, objective: string, platforms: string[], tone: string): string {
  return `Eres un director creativo con 20 años de experiencia en campañas virales para startups y marcas globales. Has trabajado para Nike, Apple, Spotify y unicornios latinoamericanos.

ANÁLISIS DEL NEGOCIO:
${JSON.stringify(analysis, null, 2)}

OBJETIVO DE LA CAMPAÑA: ${objective}
PLATAFORMAS: ${platforms.join(', ')}
TONO: ${tone}

Genera exactamente 10 ideas de campaña únicas, poderosas y diferenciadas. No ideas genéricas — ideas que un CMO de Notion o Figma aprobaría.

Devuelve ÚNICAMENTE JSON válido:
{
  "campaigns": [
    {
      "id": 1,
      "title": "nombre de la campaña",
      "concept": "concepto central en 1 línea contundente",
      "angle": "miedo | aspiración | curiosidad | social_proof | humor | urgencia | identidad",
      "hook": "el hook principal — primeras palabras que detienen el scroll",
      "headline": "titular principal listo para usar",
      "subheadline": "subtítulo complementario",
      "body_preview": "preview del copy (2-3 oraciones)",
      "why_it_works": "explicación estratégica de por qué esta idea convierte",
      "viral_potential": "por qué y cómo podría volverse viral",
      "best_format": "reel | carrusel | story | post | tiktok | anuncio_pagado",
      "emotion": "emoción principal que activa",
      "weakness": "qué podría fallar y cómo mitigarlo"
    }
  ]
}`
}
