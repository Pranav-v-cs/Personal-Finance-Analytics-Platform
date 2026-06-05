import { useMemo, useState } from 'react'
import { Badge } from '../components/common/Badge'
import { EmptyState } from '../components/common/EmptyState'
import { InlineError } from '../components/common/InlineError'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton, SkeletonLine } from '../components/common/Skeleton'
import { QuickAdd } from '../components/QuickAdd'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
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

function ExpensesSkeleton() {
  return (
    <div className="expenses-layout">
      <Card className="expenses-panel">
        <SkeletonLine className="w-48" />
        <Skeleton className="filters-skeleton" />
      </Card>
      <Card className="expenses-panel">
        <Skeleton className="table-skeleton" />
      </Card>
    </div>
  )
}

export default function ExpensesPage() {
  const { expenses, categories, filters, setFilters, loading, saving, error, createExpenseItem, updateExpenseItem, removeExpenseItem } = useExpenses()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

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
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      title: form.title.trim(),
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
      <>
        <PageHeader eyebrow="Expenses" title="Track, filter, and edit expenses" description="Loading your records..." />
        <ExpensesSkeleton />
      </>
    )
  }

    return (
      <div className="expenses-layout">
        <PageHeader
          eyebrow="Expenses"
          title="Track, filter, and edit expenses"
          description="Use the filters to narrow the list, or keep a working form open while you review recent items."
          actions={<Badge tone="default">{visibleExpenses.length} items</Badge>}
        />

        <InlineError message={error} />

        <Card className="expenses-panel quick-add-panel">
          <QuickAdd categories={categories} onSubmit={createExpenseItem} saving={saving} />
        </Card>

        <div className="expenses-grid">
          <Card className="expenses-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">{editingId ? 'Edit expense' : 'New expense'}</div>
              <h2>{editingId ? 'Update record' : 'Add record'}</h2>
            </div>
            {editingId ? (
              <button type="button" className="text-button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>

          <form className="expense-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Title</span>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label className="field">
              <span>Amount</span>
              <Input type="number" step="0.01" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
            </label>
            <label className="field">
              <span>Category</span>
              <Select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </label>
            <label className="field">
              <span>Date</span>
              <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="field field-full">
              <span>Notes</span>
              <Textarea rows="4" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </label>
            <div className="form-actions">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update expense' : 'Add expense'}</Button>
              <Button type="button" variant="ghost" onClick={resetForm}>Clear</Button>
            </div>
          </form>
        </Card>

        <Card className="expenses-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Filters</div>
              <h2>Refine results</h2>
            </div>
          </div>
          <div className="filter-grid">
            <label className="field">
              <span>Search</span>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Food, rent, travel..." />
            </label>
            <label className="field">
              <span>Category</span>
              <Select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </label>
            <label className="field">
              <span>Start date</span>
              <Input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} />
            </label>
            <label className="field">
              <span>End date</span>
              <Input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} />
            </label>
            <label className="field">
              <span>Min amount</span>
              <Input type="number" step="0.01" min="0" value={filters.minAmount} onChange={(event) => setFilters((current) => ({ ...current, minAmount: event.target.value }))} />
            </label>
            <label className="field">
              <span>Max amount</span>
              <Input type="number" step="0.01" min="0" value={filters.maxAmount} onChange={(event) => setFilters((current) => ({ ...current, maxAmount: event.target.value }))} />
            </label>
          </div>
        </Card>
      </div>

      <Card className="expenses-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">List</div>
            <h2>Recent expenses</h2>
          </div>
        </div>

        {visibleExpenses.length === 0 ? (
          <EmptyState title="No expenses match these filters." description="Clear the filters or add a new record to get started." actionLabel="Reset form" onAction={resetForm} />
        ) : (
          <div className="expense-table">
            <div className="expense-table-head">
              <span>Title</span>
              <span>Category</span>
              <span>Date</span>
              <span>Amount</span>
              <span />
            </div>
            {visibleExpenses.map((expense) => (
              <div key={expense.id} className="expense-table-row">
                <div>
                  <strong>{expense.title || 'Expense'}</strong>
                  <span>{expense.notes || 'No notes'}</span>
                </div>
                <span>{expense.category}</span>
                <span>{formatDate(expense.date || expense.transaction_date)}</span>
                <strong>{formatCurrency(expense.amount)}</strong>
                <div className="row-actions">
                  <button type="button" className="text-button" onClick={() => startEdit(expense)}>Edit</button>
                  <button type="button" className="text-button danger" onClick={() => removeExpenseItem(expense.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
