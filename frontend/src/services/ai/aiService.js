import { api } from '../api'

export async function generateAIResponse(provider, prompt, financialContext) {
  const { data } = await api.post('/ai/generate', {
    provider,
    prompt,
    context: financialContext,
  })
  return data.response
}
