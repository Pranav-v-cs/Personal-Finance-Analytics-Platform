import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { InlineError } from '../components/common/InlineError'
import { Skeleton, SkeletonLine } from '../components/ui/Skeleton'
import { Input, Select } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Separator } from '../components/ui/Separator'
import { useBudgets } from '../hooks/useBudgets'
import { formatCurrency } from '../utils/format'
import { listCategories } from '../services/categoryService'

function BudgetSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <SkeletonLine className="w-32 mb-3" />
          <Skeleton className="h-2 w-full rounded" />
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-base">{budget.category}</CardTitle>
            <Badge variant={status.tone}>{status.label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(budget)}>Delete</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
      <div className="flex justify-center py-2">
        <svg viewBox="0 0 120 120">
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Spent</span>
          <span className="font-semibold font-mono">{formatCurrency(current)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Limit</span>
          <span className="font-semibold font-mono">{formatCurrency(limit)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Remaining</span>
          <span className={`font-semibold font-mono ${remaining === 0 ? 'text-[var(--accent)]' : ''}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden mt-4">
        <div
          className="h-full rounded-full transition-all"
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
      </CardContent>
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-base">{goal.name}</CardTitle>
            {daysLeft !== null && (
              <Badge variant={daysLeft <= 7 ? 'warning' : daysLeft <= 30 ? 'info' : 'success'}>
                {daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onAddFunds(goal)}>Add funds</Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(goal)}>Delete</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
      <div className="flex justify-center py-2">
        <svg viewBox="0 0 120 120">
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Saved</span>
          <span className="font-semibold font-mono">{formatCurrency(current)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Target</span>
          <span className="font-semibold font-mono">{formatCurrency(target)}</span>
        </div>
        {dailyNeeded !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Daily needed</span>
            <span className="text-[var(--accent)] font-bold">{formatCurrency(dailyNeeded)}</span>
          </div>
        )}
        {pct >= 100 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Status</span>
            <span className="font-semibold font-mono" style={{ color: '#66bb6a', fontWeight: 700 }}>Goal reached!</span>
          </div>
        )}
      </div>

      <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden mt-4">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: pct >= 100 ? 'linear-gradient(90deg, #66bb6a, #2e7d32)' : 'linear-gradient(90deg, var(--accent), #42a5f5)',
          }}
        />
      </div>
      </CardContent>
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal-name">Goal name</Label>
        <Input id="goal-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal-amount">Target amount (₹)</Label>
        <Input id="goal-amount" type="number" step="0.01" min="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="100000" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal-date">Target date (optional)</Label>
        <Input id="goal-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </div>
      {error && <InlineError message={error} />}
      <div className="flex items-center gap-2 pt-2">
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <p className="text-sm">Adding funds to <strong>{goal.name}</strong></p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="add-funds-amount">Amount to add (₹)</Label>
        <Input id="add-funds-amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" />
      </div>
      {error && <InlineError message={error} />}
      <div className="flex items-center gap-2 pt-2">
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="budget-category">Category</Label>
        <Select id="budget-category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={!!initial}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="budget-limit">Monthly limit (₹)</Label>
        <Input id="budget-limit" type="number" step="0.01" min="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5000" />
      </div>
      {error && <InlineError message={error} />}
      <div className="flex items-center gap-2 pt-2">
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

  const { totalBudgeted, totalSpent, budgetCount, budgetUtilization } = useMemo(() => {
    let spent = 0; let limit = 0
    budgets.forEach((b) => {
      spent += Number(b.current_spend || 0)
      limit += Number(b.monthly_limit || 0)
    })
    return {
      totalBudgeted: limit,
      totalSpent: spent,
      budgetCount: budgets.length,
      budgetUtilization: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    }
  }, [budgets])

  const activeGoals = useMemo(() => {
    const completed = []
    const active = []
    goals.forEach((g) => {
      const pct = Number(g.target_amount) > 0 ? (Number(g.current_amount || 0) / Number(g.target_amount)) * 100 : 0
      if (pct >= 100) completed.push(g)
      else active.push(g)
    })
    return { active, completed }
  }, [goals])

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
      <PageContainer>
        <PageHeader eyebrow="Planning" title="Budgets & goals" description="Set spending limits and track financial goals." />
        <BudgetSkeleton />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Planning" title="Budgets & goals" description="Set spending limits and track financial goals." />
        <InlineError message={error} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-8">
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
        <Card>
          <CardHeader>
            <CardTitle>Create budget</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetForm categories={availableCategories} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit budget</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetForm categories={[editing.category]} onSubmit={handleUpdate} onCancel={() => setEditing(null)} initial={editing} />
          </CardContent>
        </Card>
      )}

      {budgets.length === 0 && !showForm ? (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--muted)] text-center py-8">
              Create a budget to start tracking spending targets and improve your Financial Health score.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--muted)] font-medium">Total spent</span>
                <span className="text-xl font-extrabold tracking-tight">{formatCurrency(totalSpent)}</span>
                <span className="text-[10px] text-[var(--muted)]">of {formatCurrency(totalBudgeted)} budgeted</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--muted)] font-medium">Utilization</span>
                <span className="text-xl font-extrabold tracking-tight">{budgetUtilization}%</span>
                <span className="text-[10px] text-[var(--muted)]">overall budget used</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--muted)] font-medium">Active budgets</span>
                <span className="text-xl font-extrabold tracking-tight">{budgetCount}</span>
                <span className="text-[10px] text-[var(--muted)]">categories tracked</span>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={setEditing} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold tracking-tight">Goals</h2>
          <p className="text-sm text-[var(--muted)]">Set savings targets and track your progress.</p>
        </div>
        <Button onClick={() => { setShowGoalForm(true); setEditingGoal(null); setFundingGoal(null) }}>
          New goal
        </Button>
      </div>

      {showGoalForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create goal</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm onSubmit={handleGoalCreate} onCancel={() => setShowGoalForm(false)} />
          </CardContent>
        </Card>
      )}

      {editingGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Edit goal</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm onSubmit={handleGoalUpdate} onCancel={() => setEditingGoal(null)} initial={editingGoal} />
          </CardContent>
        </Card>
      )}

      {fundingGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Add funds</CardTitle>
          </CardHeader>
          <CardContent>
            <AddFundsForm goal={fundingGoal} onSubmit={handleGoalAddFunds} onCancel={() => setFundingGoal(null)} />
          </CardContent>
        </Card>
      )}

      {goals.length === 0 && !showGoalForm ? (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--muted)] text-center py-8">
              Set a savings goal to improve your Financial Health score and track progress toward your financial targets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeGoals.active.length > 0 && (
            <>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Active goals</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGoals.active.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onDelete={handleGoalDelete} onAddFunds={setFundingGoal} />
                ))}
              </div>
            </>
          )}
          {activeGoals.completed.length > 0 && (
            <details>
              <summary className="cursor-pointer text-sm">
                <span style={{ fontWeight: 600 }}>
                  Completed goals ({activeGoals.completed.length})
                </span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {activeGoals.completed.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onDelete={handleGoalDelete} onAddFunds={setFundingGoal} />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
    </PageContainer>
  )
}
