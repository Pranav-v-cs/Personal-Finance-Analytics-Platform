import { useMemo, useState, useRef, useEffect } from 'react'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/common/EmptyState'
import { InlineError } from '../components/common/InlineError'
import { PageHeader } from '../components/common/PageHeader'
import { PageContainer } from '../components/layout/PageContainer'
import { Skeleton, SkeletonLine } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input, Select, Textarea } from '../components/ui/Input'
import { adaptExpense } from '../utils/expense'
import { formatCurrency, formatDate } from '../utils/format'
import { useExpenses } from '../hooks/useExpenses'

const emptyForm = {
  title: '',
  amount: '',
  category: '',
  date: '',
  notes: '',
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function ExpensesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <SkeletonLine className="w-48 mb-4" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ExpensesPage() {
  const { expenses, categories, filters, setFilters, loading, saving, error, createExpenseItem, updateExpenseItem, removeExpenseItem } = useExpenses()
  const amountRef = useRef(null)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm, date: todayString() })
  const [showMore, setShowMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!editingId) amountRef.current?.focus()
  }, [editingId])

  const visibleExpenses = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return expenses
    return expenses.filter((expense) => {
      const haystack = `${expense.title || ''} ${expense.notes || ''} ${expense.category || ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [expenses, search])

  const startEdit = (expense) => {
    const adapted = adaptExpense(expense)
    setEditingId(expense.id)
    setForm({
      title: adapted.title || '',
      amount: String(adapted.amount || ''),
      category: adapted.category || '',
      date: adapted.date || '',
      notes: adapted.notes || '',
    })
    setShowMore(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({ ...emptyForm, date: todayString() })
    setShowMore(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.category) return
    const payload = {
      title: editingId ? form.title.trim() : form.category,
      amount: form.amount,
      category: form.category,
      date: form.date,
      notes: form.notes,
    }

    if (editingId) {
      await updateExpenseItem(editingId, payload)
    } else {
      await createExpenseItem(payload)
    }
    resetForm()
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Transactions" title="Record and manage expenses" description="Loading your records..." />
        <ExpensesSkeleton />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Transactions"
          title="Record and manage expenses"
          description="Add new records, browse history, or filter by category, date, or amount."
          actions={<Badge variant="default">{visibleExpenses.length} items</Badge>}
        />

        <InlineError message={error} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* --- Add Transaction Card (QuickAdd-style) --- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--accent)] font-semibold">
                    {editingId ? 'Edit expense' : 'Quick add'}
                  </span>
                  <CardTitle>{editingId ? 'Update record' : 'Add transaction'}</CardTitle>
                </div>
                {editingId ? (
                  <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
                ) : null}
              </div>
            </CardHeader>

            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs text-[var(--muted)] font-medium">Amount</label>
                    <input
                      ref={amountRef}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                      className="h-10 w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-lg font-bold font-mono text-[var(--text)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--muted)] font-medium">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                      className="h-10 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[var(--muted)] font-medium">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                          form.category === cat
                            ? 'border-[var(--accent)] bg-[rgba(124,116,232,0.12)] text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]'
                        }`}
                        onClick={() => setForm((current) => ({ ...current, category: cat }))}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="text-xs text-[var(--accent)] font-semibold hover:underline self-start"
                  onClick={() => setShowMore((current) => !current)}
                >
                  {showMore ? 'Fewer options' : 'More options'}
                </button>

                {showMore ? (
                  <div className="flex flex-col gap-3">
                    {editingId ? (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-[var(--muted)] font-medium">Title</label>
                        <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Expense title" />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[var(--muted)] font-medium">Notes</label>
                      <textarea
                        rows="2"
                        value={form.notes}
                        onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                        placeholder="Optional notes or description..."
                        className="flex min-h-[60px] w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 pt-1">
                  <Button type="submit" disabled={saving || !form.category || !form.amount}>
                    {saving ? 'Saving...' : editingId ? 'Update' : 'Add expense'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetForm}>Clear</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* --- Search & Filters Card --- */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-0">
                <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-semibold">Search</span>
                <CardTitle>Find transactions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, category, or notes..."
                    className="text-base"
                  />
                </div>

                <button
                  type="button"
                  className="text-xs text-[var(--accent)] font-semibold hover:underline self-start"
                  onClick={() => setShowFilters((current) => !current)}
                >
                  {showFilters ? 'Fewer filters' : 'More filters'}
                </button>

                {showFilters ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[var(--muted)] font-medium">Category</label>
                      <Select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
                        <option value="">All categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[var(--muted)] font-medium">Start date</label>
                      <Input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[var(--muted)] font-medium">End date</label>
                      <Input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[var(--muted)] font-medium">Min amount</label>
                      <Input type="number" step="0.01" min="0" value={filters.minAmount} onChange={(event) => setFilters((current) => ({ ...current, minAmount: event.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[var(--muted)] font-medium">Max amount</label>
                      <Input type="number" step="0.01" min="0" value={filters.maxAmount} onChange={(event) => setFilters((current) => ({ ...current, maxAmount: event.target.value }))} />
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-0">
              <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-semibold">List</span>
              <CardTitle>Recent expenses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {visibleExpenses.length === 0 ? (
              <div className="p-6">
                <EmptyState title="No expenses match these filters." description="Clear the filters or add a new record to get started." actionLabel="Reset form" onAction={resetForm} />
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="hidden lg:grid lg:grid-cols-5 gap-4 px-6 py-3 text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">
                  <span>Title</span>
                  <span>Category</span>
                  <span>Date</span>
                  <span>Amount</span>
                  <span />
                </div>
                {visibleExpenses.map((expense) => (
                  <div key={expense.id} className="grid grid-cols-1 lg:grid-cols-5 gap-2 lg:gap-4 items-center px-6 py-3 border-b border-[var(--border)] last:border-0">
                    <div>
                      <strong className="text-sm">{expense.title || 'Expense'}</strong>
                      <p className="text-xs text-[var(--muted)]">{expense.notes || 'No notes'}</p>
                    </div>
                    <span className="text-sm">{expense.category}</span>
                    <span className="text-sm text-[var(--muted)]">{formatDate(expense.date || expense.transaction_date)}</span>
                    <strong className="text-sm font-mono">{formatCurrency(expense.amount)}</strong>
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(expense)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => removeExpenseItem(expense.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
