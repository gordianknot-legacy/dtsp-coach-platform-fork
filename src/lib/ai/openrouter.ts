import OpenAI from 'openai'

// OpenRouter uses the OpenAI-compatible API spec
// Free models available: meta-llama/llama-3.1-8b-instruct:free, qwen/qwen-2-7b-instruct:free
export function createOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'DTSP Coach Platform',
    },
  })
}

// Primary model: Llama 3.1 8B (free tier)
// Fallback: Qwen 2 7B (free tier)
export const FREE_MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
]

export async function generateHindiSummary(params: {
  teacherName: string
  sessionDate: string
  focusTag: string | null
  whatDiscussed: string
  whatDecided: string
  actionSteps: { description: string }[]
}): Promise<{ draft: string; model: string; error?: string }> {
  const client = createOpenRouterClient()

  const actionStepsList = params.actionSteps.length > 0
    ? params.actionSteps.map((s, i) => `${i + 1}. ${s.description}`).join('\n')
    : 'कोई एक्शन स्टेप नहीं'

  const prompt = `You are a teacher coaching assistant. Write a brief WhatsApp message in Hindi (Devanagari script) summarizing a coaching session.

The message should:
- Be under 150 words
- Be warm and encouraging in tone
- Be in simple Hindi that teachers in Uttar Pradesh would understand
- Include: what was discussed, what the teacher will practice, next steps
- NOT mention the coach's name or organization details

Session details:
- Teacher: ${params.teacherName}
- Date: ${new Date(params.sessionDate).toLocaleDateString('hi-IN')}
- Focus area: ${params.focusTag ?? 'General coaching'}
- What was discussed: ${params.whatDiscussed}
- What was decided: ${params.whatDecided}
- Action steps:
${actionStepsList}

Write ONLY the WhatsApp message in Hindi. No English. No formatting headers.`

  // Try primary model, fall back to secondary
  for (const model of FREE_MODELS) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      })

      const draft = response.choices[0]?.message?.content?.trim() ?? ''
      if (draft) return { draft, model }
    } catch (err) {
      // Try next model
      continue
    }
  }

  return { draft: '', model: '', error: 'All models failed or rate limited' }
}
