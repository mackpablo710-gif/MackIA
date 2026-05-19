export function buildVideoQuestionsPrompt(campaign: object): string {
  return `Eres un director de video especializado en contenido viral para redes sociales.

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}

Antes de crear el guion, necesitas información sobre el video. Genera las preguntas clave.

Devuelve ÚNICAMENTE JSON válido:
{
  "questions": [
    {
      "id": "video_type",
      "question": "¿Qué tipo de video quieres crear?",
      "type": "select",
      "options": ["Persona hablando a cámara", "Video de producto", "UGC (User Generated Content)", "Animado / Motion Graphics", "Narrado con imágenes", "TikTok viral", "Corporativo / Presentación"]
    },
    {
      "id": "duration",
      "question": "¿Cuánto durará el video?",
      "type": "select",
      "options": ["15 segundos", "30 segundos", "45 segundos", "60 segundos"]
    },
    {
      "id": "style",
      "question": "¿Cuál es el estilo visual?",
      "type": "select",
      "options": ["Dinámico y rápido", "Emocional y lento", "Educativo / Explicativo", "Divertido y casual", "Premium y elegante"]
    }
  ]
}`
}

export function buildVideoScriptPrompt(campaign: object, videoType: string, duration: string, style: string, platform: string): string {
  const seconds = parseInt(duration) || 30
  const sceneCount = Math.ceil(seconds / 5)

  return `Eres el director creativo de los videos más virales de TikTok e Instagram en Latinoamérica. Combinas storytelling con performance marketing.

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}

TIPO DE VIDEO: ${videoType}
DURACIÓN: ${duration}
ESTILO: ${style}
PLATAFORMA: ${platform}
NÚMERO DE ESCENAS APROXIMADO: ${sceneCount}

Genera el guion completo y profesional.

Devuelve ÚNICAMENTE JSON válido:
{
  "hook": "primeros 3 segundos — lo que detiene el scroll (CRÍTICO)",
  "hook_analysis": "por qué este hook funciona psicológicamente",
  "scenes": [
    {
      "id": 1,
      "duration": "3s",
      "visual": "qué se ve en pantalla — descripción detallada",
      "voiceover": "texto hablado exacto (si aplica)",
      "text_overlay": "texto que aparece en pantalla",
      "music_note": "instrucción musical para esta escena",
      "transition": "tipo de transición al siguiente"
    }
  ],
  "cta_final": "llamada a acción en los últimos 3 segundos",
  "total_duration": "${duration}",
  "video_prompt": "prompt para Runway / Pika / Luma (en inglés, detallado)",
  "casting_notes": "instrucciones si hay persona en cámara",
  "music_style": "estilo de música recomendado",
  "director_notes": "instrucciones técnicas para el editor",
  "estimated_hook_rate": "tasa de retención estimada en los primeros 3s",
  "storyboard_summary": "resumen visual escena por escena"
}`
}
