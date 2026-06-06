export function getDashboardSummary(): Promise<Record<string, unknown>>
export function getMonthlySpending(): Promise<{ month: string; label: string; total: number }[]>
export function getRecentExpenses(): Promise<unknown>
export function getDashboardCategories(): Promise<{ category: string; total: number; percent: number }[]>
export function getCategoryMonthly(): Promise<{ month: string; category: string; total_amount: number }[]>
export function getDashboardAnalytics(): Promise<{
  anomaly_candidates: { id: number; title: string; amount: number; category: string; date: string; z_score: number }[]
  weekly_metrics: unknown[]
  weekday_aggregates: unknown[]
  largest_transactions: unknown[]
}>
