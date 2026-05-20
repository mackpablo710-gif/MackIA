export function buildVideoQuestionsPrompt(campaign: object): string {
  return `Eres un director de video especializado en contenido viral para redes sociales.

CAMPAÑA:
${JSON.stringify(campaign, null, 2)}

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
  const sceneCount = Math.max(3, Math.ceil(seconds / 5))

  const campaignData = campaign as Record<string, unknown>

  return `Eres el Director Creativo de los videos más virales en TikTok, Instagram Reels y YouTube Shorts en Latinoamérica. Tus videos combinan STORYTELLING EMOCIONAL con PERFORMANCE MARKETING.

TU FILOSOFÍA DE VIDEO PUBLICITARIO:

LOS PRIMEROS 3 SEGUNDOS SON TODO:
- Si el espectador no se detiene en 3 segundos, el video murió.
- El hook debe activar una de estas palancas: MIEDO, CURIOSIDAD, SORPRESA, RECONOCIMIENTO ("eso me pasa a mí")
- Nunca empieces con logo, música intro larga, o presentación de empresa.

ESTRUCTURA PROBADA DE ALTA CONVERSIÓN:
1. HOOK (0-3s): Patrón de interrupción — pregunta, dato impactante, situación reconocible
2. AMPLIFICACIÓN (3-8s): Profundizar el dolor / curiosidad / problema
3. SOLUCIÓN (8-20s): Revelar la respuesta — el producto como héroe secundario, el cliente como héroe principal
4. PRUEBA (20-25s): Social proof, resultado, antes/después
5. CTA (últimos 3-5s): Una sola acción clara y urgente

CAMPAÑA:
- Título: ${campaignData.title ?? ''}
- Concepto: ${campaignData.concept ?? ''}
- Hook principal: ${campaignData.hook ?? ''}
- Ángulo: ${campaignData.angle ?? ''}
- Emoción: ${campaignData.emotion ?? ''}
- Concepto visual: ${JSON.stringify(campaignData.visual_concept ?? {})}

TIPO DE VIDEO: ${videoType}
DURACIÓN: ${duration} (${sceneCount} escenas aproximadas)
ESTILO: ${style}
PLATAFORMA: ${platform}

FORMATOS POR PLATAFORMA:
- TikTok / Instagram Reels: 1080x1920 (9:16 vertical) — texto en zona central y bottom
- Instagram Feed: 1080x1350 (4:5 vertical)
- LinkedIn Video: 1200x627 (16:9 horizontal)
- Facebook Video: 1080x1080 (1:1 cuadrado)

Genera el guion completo, escena por escena, listo para producir.

Devuelve ÚNICAMENTE JSON válido:
{
  "hook": "texto EXACTO de los primeros 3 segundos — lo que dice/muestra para detener el scroll",
  "hook_analysis": "por qué este hook funciona — qué palanca psicológica activa",
  "hook_type": "MIEDO|CURIOSIDAD|SORPRESA|RECONOCIMIENTO|DATO_IMPACTANTE|PREGUNTA",
  "scenes": [
    {
      "id": 1,
      "duration": "3s",
      "visual": "descripción exacta de lo que se ve en pantalla — qué persona, qué acción, qué ambiente, iluminación",
      "voiceover": "texto hablado EXACTO (con pausas marcadas con / ) — si aplica",
      "text_overlay": "texto que aparece en pantalla — fuente, posición, animación sugerida",
      "music_note": "instrucción musical para esta escena (tempo, mood, instrumento dominante)",
      "transition": "cut|fade|swipe|zoom|whip_pan|match_cut — hacia la siguiente escena",
      "emotion_target": "qué emoción debe sentir el espectador en este momento"
    }
  ],
  "cta_final": "texto EXACTO del CTA final — urgente, específico, sin fricción",
  "total_duration": "${duration}",
  "platform_format": "${platform === 'tiktok' || platform === 'instagram' ? '1080x1920 (9:16)' : platform === 'linkedin' ? '1200x627 (16:9)' : '1080x1080 (1:1)'}",
  "video_prompt": "prompt completo en inglés para Runway / Pika / Luma / Sora — descripción visual detallada de la escena principal",
  "casting_notes": "descripción exacta del talent si aparece persona: edad, look, emoción, ropa, qué NO usar",
  "music_style": "género, tempo BPM, referencia de artista, mood emocional completo",
  "director_notes": "instrucciones técnicas para el editor: ritmo de corte, efectos de sonido clave, zooms de énfasis",
  "estimated_hook_rate": "tasa de retención estimada en primeros 3 segundos (%)",
  "expected_completion_rate": "tasa de visualización completa estimada (%)",
  "storyboard_summary": "resumen visual escena por escena en 1 línea cada una",
  "production_tips": "3 tips específicos para filmar este video con calidad profesional sin equipo costoso"
}`
}
