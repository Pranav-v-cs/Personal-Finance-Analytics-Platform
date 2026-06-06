import { describe, it, expect } from 'vitest'

// Direct copy of the getBudgetStatus function from BudgetsPage.jsx
function getBudgetStatus(pct) {
  if (pct > 100) return { label: 'Over budget', tone: 'danger', health: 'critical' }
  if (pct >= 90) return { label: 'Critical', tone: 'warning', health: 'critical' }
  if (pct >= 75) return { label: 'Warning', tone: 'warning', health: 'warning' }
  return { label: 'Healthy', tone: 'success', health: 'healthy' }
}

describe('getBudgetStatus', () => {
  it('returns healthy for under 75%', () => {
    expect(getBudgetStatus(0)).toEqual({ label: 'Healthy', tone: 'success', health: 'healthy' })
    expect(getBudgetStatus(50)).toEqual({ label: 'Healthy', tone: 'success', health: 'healthy' })
    expect(getBudgetStatus(74.9)).toEqual({ label: 'Healthy', tone: 'success', health: 'healthy' })
  })

  it('returns warning at 75-89%', () => {
    expect(getBudgetStatus(75)).toEqual({ label: 'Warning', tone: 'warning', health: 'warning' })
    expect(getBudgetStatus(80)).toEqual({ label: 'Warning', tone: 'warning', health: 'warning' })
    expect(getBudgetStatus(89.9)).toEqual({ label: 'Warning', tone: 'warning', health: 'warning' })
  })

  it('returns critical at 90-100%', () => {
    expect(getBudgetStatus(90)).toEqual({ label: 'Critical', tone: 'warning', health: 'critical' })
    expect(getBudgetStatus(95)).toEqual({ label: 'Critical', tone: 'warning', health: 'critical' })
    expect(getBudgetStatus(100)).toEqual({ label: 'Critical', tone: 'warning', health: 'critical' })
  })

  it('returns over budget above 100%', () => {
    expect(getBudgetStatus(101)).toEqual({ label: 'Over budget', tone: 'danger', health: 'critical' })
    expect(getBudgetStatus(150)).toEqual({ label: 'Over budget', tone: 'danger', health: 'critical' })
    expect(getBudgetStatus(999)).toEqual({ label: 'Over budget', tone: 'danger', health: 'critical' })
  })

  it('handles edge cases', () => {
    expect(getBudgetStatus(-1)).toEqual({ label: 'Healthy', tone: 'success', health: 'healthy' })
    expect(getBudgetStatus(NaN)).toEqual({ label: 'Healthy', tone: 'success', health: 'healthy' })
  })
})
