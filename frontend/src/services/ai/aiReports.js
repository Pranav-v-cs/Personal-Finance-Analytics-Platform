import { generateAIResponse } from './aiService'
import { buildFinancialContext } from './financialContextBuilder'

export async function generateFinancialReport(data) {
  const context = buildFinancialContext(data)
  const prompt = `Generate a concise executive financial report based on the data provided. Include the following sections:

1. Executive Summary — 2-3 sentence overview of spending and trends
2. Budget Analysis — which budgets are on track, at risk, or over; current utilization
3. Goal Analysis — progress on savings goals
4. Forecast Analysis — projected month-end spend and confidence
5. Savings Opportunities — 2 specific data-backed suggestions
6. Recommendations — 2-3 actionable next steps

Format with clear section headings. Be specific and data-driven. Do not give generic financial advice.`
  return generateAIResponse(prompt, context)
}
