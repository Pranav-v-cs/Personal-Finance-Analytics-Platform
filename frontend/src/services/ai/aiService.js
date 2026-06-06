import { api } from '../api'

export async function generateAIResponse(provider, prompt, financialContext) {
  const result = await api.post('/ai/generate', {
    provider,
    prompt,
    context: financialContext,
  })
  return result.response
}
