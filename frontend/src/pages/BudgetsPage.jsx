import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/ui/Button'
import { InlineError } from '../components/common/InlineError'
import { Skeleton, SkeletonLine } from '../components/common/Skeleton'
import { useBudgets } from '../hooks/useBudgets'
import { formatCurrency } from '../utils/format'
import { listCategories } from '../services/categoryService'

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

function GoalCard({ goal, onEdit, onDelete, onAddFunds }) {
  const current = Number(goal.current_amount || 0)
  const target = Number(goal.target_amount)
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0

  let daysLeft = null
  if (goal.target_date) {
    daysLeft = Math.max(0, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)))
  }

  const dailyNeeded = daysLeft && daysLeft > 0 && current < target
    ? Math.ceil((target - current) / daysLeft)
    : null

  return (
    <Card className="goal-card">
      <div className="goal-card-header">
        <div>
          <div className="goal-name">{goal.name}</div>
          {daysLeft !== null && (
            <Badge tone={daysLeft <= 7 ? 'warning' : daysLeft <= 30 ? 'info' : 'success'}>
              {daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
            </Badge>
          )}
        </div>
        <div className="budget-actions">
          <button type="button" className="text-button" onClick={() => onAddFunds(goal)}>Add funds</button>
          <button type="button" className="text-button" onClick={() => onEdit(goal)}>Edit</button>
          <button type="button" className="text-button danger" onClick={() => onDelete(goal)}>Delete</button>
        </div>
      </div>

      <div className="budget-ring-wrap">
        <svg className="budget-ring" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={pct >= 100 ? '#66bb6a' : pct >= 75 ? '#42a5f5' : '#f7b14a'}
            strokeWidth="10"
            strokeDasharray={`${pct * 3.266} 326.6`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="56" textAnchor="middle" fill="var(--text)" fontSize="1.5rem" fontWeight="800" fontFamily="var(--font-mono)">
            {Math.round(pct)}%
          </text>
          <text x="60" y="74" textAnchor="middle" fill="var(--muted)" fontSize="0.65rem">
            saved
          </text>
        </svg>
      </div>

      <div className="budget-details">
        <div className="budget-detail-row">
          <span className="budget-detail-label">Saved</span>
          <span className="budget-detail-value">{formatCurrency(current)}</span>
        </div>
        <div className="budget-detail-row">
          <span className="budget-detail-label">Target</span>
          <span className="budget-detail-value">{formatCurrency(target)}</span>
        </div>
        {dailyNeeded !== null && (
          <div className="budget-detail-row">
            <span className="budget-detail-label">Daily needed</span>
            <span className="budget-detail-value budget-highlight">{formatCurrency(dailyNeeded)}</span>
          </div>
        )}
        {pct >= 100 && (
          <div className="budget-detail-row">
            <span className="budget-detail-label">Status</span>
            <span className="budget-detail-value" style={{ color: '#66bb6a', fontWeight: 700 }}>Goal reached!</span>
          </div>
        )}
      </div>

      <div className="budget-bar-track">
        <div
          className="budget-bar-fill"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: pct >= 100 ? 'linear-gradient(90deg, #66bb6a, #2e7d32)' : 'linear-gradient(90deg, var(--accent), #42a5f5)',
          }}
        />
      </div>
    </Card>
  )
}

function GoalForm({ onSubmit, onCancel, initial }) {
  const [name, setName] = useState(initial?.name || '')
  const [targetAmount, setTargetAmount] = useState(initial ? String(Number(initial.target_amount)) : '')
  const [targetDate, setTargetDate] = useState(initial?.target_date ? initial.target_date.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Enter a goal name'); return }
    const val = parseFloat(targetAmount)
    if (!val || val <= 0) { setError('Target amount must be greater than 0'); return }
    setSaving(true)
    try {
      await onSubmit({ name: name.trim(), targetAmount: val, targetDate: targetDate || null })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="label">Goal name</label>
        <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund" />
      </div>
      <div className="field">
        <label className="label">Target amount (₹)</label>
        <input className="input" type="number" step="0.01" min="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="100000" />
      </div>
      <div className="field">
        <label className="label">Target date (optional)</label>
        <input className="input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </div>
      {error && <InlineError message={error} />}
      <div className="form-actions">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : initial ? 'Update' : 'Create goal'}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}

function AddFundsForm({ goal, onSubmit, onCancel }) {
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const val = parseFloat(amount)
    if (!val || val <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    try {
      await onSubmit(goal.id, val)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add funds')
      setSaving(false)
    }
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      <p className="form-note">Adding funds to <strong>{goal.name}</strong></p>
      <div className="field">
        <label className="label">Amount to add (₹)</label>
        <input className="input" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" />
      </div>
      {error && <InlineError message={error} />}
      <div className="form-actions">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add funds'}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
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
  const { budgets, goals, loading, error, refreshBudgets, createBudget, updateBudget, deleteBudget, createGoal, updateGoal, deleteGoal, budgetStats } = useBudgets()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [categories, setCategories] = useState([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [fundingGoal, setFundingGoal] = useState(null)

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

  const handleGoalCreate = async (data) => {
    await createGoal({
      ...data,
      currentAmount: 0,
    })
    setShowGoalForm(false)
    refreshBudgets()
  }

  const handleGoalUpdate = async (data) => {
    await updateGoal(editingGoal.id, {
      targetAmount: data.targetAmount,
      targetDate: data.targetDate,
    })
    setEditingGoal(null)
    refreshBudgets()
  }

  const handleGoalDelete = async (goal) => {
    if (!window.confirm(`Delete goal "${goal.name}"?`)) return
    await deleteGoal(goal.id)
    refreshBudgets()
  }

  const handleGoalAddFunds = async (id, amount) => {
    const goal = goals.find((g) => g.id === id)
    const current = Number(goal?.current_amount || 0)
    await updateGoal(id, { currentAmount: current + amount })
    setFundingGoal(null)
    refreshBudgets()
  }

  useEffect(() => {
    async function load() {
      try {
        const cats = await listCategories()
        setCategories(Array.isArray(cats) ? cats : [])
      } catch { /* ignore */ }
    }
    load()
  }, [])

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

      <hr className="section-divider" />

      <div className="section-header-wrap">
        <div className="section-header">
          <h2 className="section-title">Goals</h2>
          <p className="section-desc">Track progress towards your financial targets.</p>
        </div>
        <Button onClick={() => { setShowGoalForm(true); setEditingGoal(null); setFundingGoal(null) }}>
          New goal
        </Button>
      </div>

      {showGoalForm && (
        <Card className="budget-form-card">
          <h3>Create goal</h3>
          <GoalForm onSubmit={handleGoalCreate} onCancel={() => setShowGoalForm(false)} />
        </Card>
      )}

      {editingGoal && (
        <Card className="budget-form-card">
          <h3>Edit goal</h3>
          <GoalForm onSubmit={handleGoalUpdate} onCancel={() => setEditingGoal(null)} initial={editingGoal} />
        </Card>
      )}

      {fundingGoal && (
        <Card className="budget-form-card">
          <h3>Add funds</h3>
          <AddFundsForm goal={fundingGoal} onSubmit={handleGoalAddFunds} onCancel={() => setFundingGoal(null)} />
        </Card>
      )}

      {goals.length === 0 && !showGoalForm ? (
        <Card className="placeholder-panel">
          <p className="panel-copy">
            No goals yet. Create your first goal to start tracking financial targets.
          </p>
        </Card>
      ) : (
        <div className="budgets-grid">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onDelete={handleGoalDelete} onAddFunds={setFundingGoal} />
          ))}
        </div>
      )}
    </div>
  )
}
