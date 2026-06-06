import { api } from '../api'

export async function generateAIResponse(prompt, financialContext) {
  const result = await api.post('/ai/generate', {
    provider: 'openrouter',
    prompt,
    context: financialContext,
  })
  return result.response
}
