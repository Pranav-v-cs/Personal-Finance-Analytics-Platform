import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/ui/Button'
import { InlineError } from '../components/common/InlineError'
import { Skeleton, SkeletonLine } from '../components/common/Skeleton'
import { useBudgets } from '../hooks/useBudgets'
import { formatCurrency } from '../utils/format'

function BudgetSkeleton() {
  return (
    <div className="budgets-grid">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="budget-card">
          <SkeletonLine className="w-32" />
          <Skeleton className="budget-bar-skeleton" />
        </Card>
      ))}
    </div>
  )
}

function getBudgetStatus(pct) {
  if (pct > 100) return { label: 'Over budget', tone: 'danger', health: 'critical' }
  if (pct >= 90) return { label: 'Critical', tone: 'warning', health: 'critical' }
  if (pct >= 75) return { label: 'Warning', tone: 'warning', health: 'warning' }
  return { label: 'Healthy', tone: 'success', health: 'healthy' }
}

function BudgetCard({ budget, onEdit, onDelete }) {
  const current = Number(budget.current_spend || 0)
  const limit = Number(budget.monthly_limit)
  const pct = limit > 0 ? Math.min((current / limit) * 100, 100) : 0
  const status = getBudgetStatus(limit > 0 ? (current / limit) * 100 : 0)
  const remaining = Math.max(limit - current, 0)

  return (
    <Card className={`budget-card budget-${status.health}`}>
      <div className="budget-card-header">
        <div>
          <div className="budget-category">{budget.category}</div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <div className="budget-actions">
          <button type="button" className="text-button" onClick={() => onEdit(budget)}>Edit</button>
          <button type="button" className="text-button danger" onClick={() => onDelete(budget)}>Delete</button>
        </div>
      </div>

      <div className="budget-ring-wrap">
        <svg className="budget-ring" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={status.health === 'critical' ? '#ef5350' : status.health === 'warning' ? '#f7b14a' : '#66bb6a'}
            strokeWidth="10"
            strokeDasharray={`${pct * 3.266} 326.6`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="56" textAnchor="middle" fill="var(--text)" fontSize="1.5rem" fontWeight="800" fontFamily="var(--font-mono)">
            {Math.round(pct)}%
          </text>
          <text x="60" y="74" textAnchor="middle" fill="var(--muted)" fontSize="0.65rem">
            used
          </text>
        </svg>
      </div>

      <div className="budget-details">
        <div className="budget-detail-row">
          <span className="budget-detail-label">Spent</span>
          <span className="budget-detail-value">{formatCurrency(current)}</span>
        </div>
        <div className="budget-detail-row">
          <span className="budget-detail-label">Limit</span>
          <span className="budget-detail-value">{formatCurrency(limit)}</span>
        </div>
        <div className="budget-detail-row">
          <span className="budget-detail-label">Remaining</span>
          <span className={`budget-detail-value ${remaining === 0 ? 'budget-over' : ''}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      <div className="budget-bar-track">
        <div
          className="budget-bar-fill"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: current > limit
              ? 'linear-gradient(90deg, #ef5350, #c62828)'
              : pct >= 75
                ? 'linear-gradient(90deg, #f7b14a, #ef5350)'
                : 'linear-gradient(90deg, var(--accent), var(--accentStrong))',
          }}
        />
      </div>
    </Card>
  )
}

function BudgetForm({ categories, onSubmit, onCancel, initial }) {
  const [category, setCategory] = useState(initial?.category || '')
  const [limit, setLimit] = useState(initial ? String(Number(initial.monthly_limit)) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!category) { setError('Select a category'); return }
    const val = parseFloat(limit)
    if (!val || val <= 0) { setError('Limit must be greater than 0'); return }
    setSaving(true)
    try {
      await onSubmit(category, val)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="label">Category</label>
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)} disabled={!!initial}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label">Monthly limit (₹)</label>
        <input className="input" type="number" step="0.01" min="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5000" />
      </div>
      {error && <InlineError message={error} />}
      <div className="form-actions">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : initial ? 'Update' : 'Create budget'}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}

function getCategoryStrings(categories) {
  return (categories || []).map((c) => (typeof c === 'string' ? c : c.category))
}

export default function BudgetsPage() {
  const { budgets, goals, loading, error, refreshBudgets, createBudget, updateBudget, deleteBudget, budgetStats } = useBudgets()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [categories, setCategories] = useState([])

  const categoryList = getCategoryStrings(categories)

  const handleCreate = async (cat, limit) => {
    await createBudget(cat, limit)
    setShowForm(false)
    refreshBudgets()
  }

  const handleUpdate = async (cat, limit) => {
    await updateBudget(editing.id, limit)
    setEditing(null)
    refreshBudgets()
  }

  const handleDelete = async (budget) => {
    if (!window.confirm(`Delete budget for ${budget.category}?`)) return
    await deleteBudget(budget.id)
    refreshBudgets()
  }

  const budgetedCategories = budgets.map((b) => b.category)
  const availableCategories = categoryList.filter((c) => !budgetedCategories.includes(c))

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Planning" title="Budgets & goals" description="Set spending limits and track financial goals." />
        <BudgetSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Planning" title="Budgets & goals" description="Set spending limits and track financial goals." />
        <InlineError message={error} />
      </>
    )
  }

  return (
    <div className="budgets-stack">
      <PageHeader
        eyebrow="Planning"
        title="Budgets & goals"
        description="Set spending limits and track financial goals."
        actions={
          <Button onClick={() => { setShowForm(true); setEditing(null) }} disabled={availableCategories.length === 0}>
            New budget
          </Button>
        }
      />

      {showForm && (
        <Card className="budget-form-card">
          <h3>Create budget</h3>
          <BudgetForm categories={availableCategories} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      {editing && (
        <Card className="budget-form-card">
          <h3>Edit budget</h3>
          <BudgetForm categories={[editing.category]} onSubmit={handleUpdate} onCancel={() => setEditing(null)} initial={editing} />
        </Card>
      )}

      {budgets.length === 0 && !showForm ? (
        <Card className="placeholder-panel">
          <p className="panel-copy">
            No budgets yet. Create your first budget to start tracking spending limits.
          </p>
        </Card>
      ) : (
        <div className="budgets-grid">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
