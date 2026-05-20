export function buildAnalystPrompt(description: string): string {
  return `Eres el Chief Strategy Officer de la agencia de publicidad digital más efectiva del mundo. Antes de crear cualquier pieza, debes pensar como un estratega que une EMOCIÓN + NEGOCIO.

Tu trabajo no es describir el negocio. Es detectar la OPORTUNIDAD PUBLICITARIA.

NEGOCIO DESCRITO:
${description}

Analiza con mentalidad de agencia premium. Piensa:
1. ¿Qué DOLOR real siente el cliente ideal?
2. ¿Qué MIEDO no dice en voz alta?
3. ¿Qué DESEO secreto tiene?
4. ¿Qué le IMPIDE resolverlo solo?
5. ¿Cuál es el MOMENTO de compra exacto?
6. ¿Qué hace este negocio que NINGÚN competidor hace igual?

Devuelve ÚNICAMENTE JSON válido (sin markdown, sin texto extra):
{
  "business_name": "nombre del negocio o marca",
  "industry": "industria o sector específico",
  "value_proposition": "propuesta de valor en 1 oración que haría parar el scroll",
  "pain_points": [
    "dolor emocional más profundo del cliente",
    "frustración más frecuente",
    "consecuencia de no resolver el problema"
  ],
  "fears": [
    "miedo que no dicen pero sienten",
    "riesgo percibido si no actúan"
  ],
  "desires": [
    "resultado final que realmente quieren",
    "versión de sí mismos que imaginan"
  ],
  "benefits": ["beneficio concreto 1", "beneficio medible 2", "transformación 3"],
  "differentiators": ["diferenciador único 1", "diferenciador único 2"],
  "target_audience": {
    "primary": "descripción específica del cliente ideal (no genérica)",
    "demographics": "edad, género, nivel socioeconómico, ubicación",
    "psychographics": "qué leen, cómo piensan, qué los motiva",
    "moment_of_purchase": "cuándo exactamente decide comprar"
  },
  "competitors": ["competidor 1", "competidor 2"],
  "hook_opportunities": [
    "primer hook poderoso basado en un dolor real",
    "segundo hook basado en curiosidad o dato sorprendente"
  ],
  "tone_recommendation": "tono ideal con razón estratégica",
  "platform_recommendation": ["instagram", "tiktok"],
  "missing_context": ["qué falta saber para trabajar mejor"],
  "quick_insight": "1 insight no obvio que el usuario probablemente no ve — algo que cambia cómo vender"
}`
}

export function buildQuestionsPrompt(description: string, missingContext: string[]): string {
  return `Eres un estratega de marketing senior en una sesión de briefing con un cliente.

NEGOCIO: ${description}
CONTEXTO FALTANTE: ${missingContext.join(', ')}

Genera entre 3 y 5 preguntas ESPECÍFICAS que desbloqueen la estrategia publicitaria.
NO preguntes cosas genéricas. Pregunta lo que cambia la campaña.

Devuelve ÚNICAMENTE JSON válido:
{
  "questions": [
    {
      "id": "q1",
      "question": "pregunta directa y específica",
      "type": "text | select | multiselect",
      "options": ["opción 1", "opción 2"],
      "placeholder": "ejemplo de respuesta",
      "why": "cómo esta respuesta cambia la estrategia"
    }
  ]
}`
}
