export function buildAnalystPrompt(description: string): string {
  return `Eres el estratega de marketing más experto del mundo. Tu trabajo es analizar negocios y extraer inteligencia de marketing accionable.

NEGOCIO DESCRITO POR EL USUARIO:
${description}

Analiza en profundidad y devuelve ÚNICAMENTE un JSON válido con exactamente esta estructura (sin texto adicional, sin markdown):
{
  "business_name": "nombre del negocio o marca",
  "industry": "industria o sector",
  "value_proposition": "propuesta de valor clara en 1 oración",
  "pain_points": ["dolor 1", "dolor 2", "dolor 3"],
  "benefits": ["beneficio 1", "beneficio 2", "beneficio 3"],
  "differentiators": ["diferenciador 1", "diferenciador 2"],
  "target_audience": {
    "primary": "descripción del cliente ideal",
    "demographics": "edad, género, ingresos, ubicación",
    "psychographics": "valores, intereses, estilo de vida"
  },
  "competitors": ["competidor 1", "competidor 2"],
  "tone_recommendation": "tono sugerido con razón breve",
  "platform_recommendation": ["instagram", "tiktok"],
  "missing_context": ["qué información falta para trabajar mejor"],
  "quick_insight": "1 insight poderoso y específico que el usuario probablemente no ve"
}`
}

export function buildQuestionsPrompt(description: string, missingContext: string[]): string {
  return `Eres un estratega de marketing senior interrogando a un cliente para entender su negocio a fondo.

NEGOCIO: ${description}
CONTEXTO FALTANTE: ${missingContext.join(', ')}

Genera entre 3 y 5 preguntas inteligentes y específicas para obtener la información necesaria.
Las preguntas deben ser conversacionales, no un formulario.

Devuelve ÚNICAMENTE JSON válido:
{
  "questions": [
    {
      "id": "q1",
      "question": "texto de la pregunta",
      "type": "text | select | multiselect",
      "options": ["opción 1", "opción 2"],
      "placeholder": "ejemplo de respuesta",
      "why": "por qué esta pregunta importa estratégicamente"
    }
  ]
}`
}
