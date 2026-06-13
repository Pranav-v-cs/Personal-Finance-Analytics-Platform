export const SUGGESTED_QUESTIONS = [
  'Where did I overspend?',
  'Which budget is at risk?',
  'How can I save money?',
  'Compare this month with last month.',
  'Explain my spending trends.',
]

export function buildPrompt(question, context) {
  const contextStr = JSON.stringify(context, null, 2)
  return `Financial Data:\n${contextStr}\n\nQuestion: ${question}`
}
