import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from './ui/Button'

const FALLBACK_CATEGORIES = [
  'Housing', 'Transportation', 'Food & Dining', 'Utilities',
  'Entertainment', 'Shopping', 'Healthcare', 'Education',
  'Travel', 'Personal', 'Groceries', 'Other',
]

function todayString() {
  return new Date().toISOString().split('T')[0]
}

export function QuickAdd({ categories: propCategories, onSubmit, saving = false }) {
  const amountRef = useRef(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(() => localStorage.getItem('lastCategory') || '')
  const [date, setDate] = useState(todayString)
  const [notes, setNotes] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const categories = useMemo(() => {
    return propCategories?.length > 0 ? propCategories : FALLBACK_CATEGORIES
  }, [propCategories])

  const frequentCategories = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('frequentCategories') || '[]')
    } catch {
      return []
    }
  }, [success])

  const sortedCategories = useMemo(() => {
    const freq = frequentCategories.filter((cat) => categories.includes(cat))
    const rest = categories.filter((cat) => !frequentCategories.includes(cat))
    return [...freq, ...rest]
  }, [categories, frequentCategories])

  useEffect(() => {
    amountRef.current?.focus()
  }, [])

  function persistCategory(cat) {
    try {
      const stored = JSON.parse(localStorage.getItem('frequentCategories') || '[]')
      const updated = [cat, ...stored.filter((c) => c !== cat)].slice(0, 10)
      localStorage.setItem('frequentCategories', JSON.stringify(updated))
      localStorage.setItem('lastCategory', cat)
    } catch {}
  }

  function isValid() {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0')
      return false
    }
    if (!category) {
      setError('Please select a category')
      return false
    }
    return true
  }

  async function handleSubmit(event) {
    if (event) event.preventDefault()
    setError('')
    setSuccess(false)

    if (!isValid()) return

    try {
      await onSubmit({
        title: category,
        amount: parseFloat(amount),
        category,
        date,
        notes: notes.trim(),
      })
      persistCategory(category)
      setAmount('')
      setCategory(localStorage.getItem('lastCategory') || '')
      setDate(todayString)
      setNotes('')
      setShowMore(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      amountRef.current?.focus()
    } catch (err) {
      setError(err.message || 'Failed to save expense')
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <div className="quick-add-header">
        <div className="eyebrow">Quick add</div>
        <h2>Add expense</h2>
      </div>

      <div className="quick-add-main">
        <div className="quick-add-field">
          <label className="quick-add-label">Amount</label>
          <input
            ref={amountRef}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(event) => { setAmount(event.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            className="quick-add-amount"
          />
        </div>

        <div className="quick-add-field">
          <label className="quick-add-label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="quick-add-date"
          />
        </div>
      </div>

      <div className="quick-add-field">
        <label className="quick-add-label">Category</label>
        <div className="category-chips">
          {sortedCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip${category === cat ? ' active' : ''}`}
              onClick={() => { setCategory(cat); setError('') }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="quick-add-toggle"
        onClick={() => setShowMore((current) => !current)}
      >
        {showMore ? 'Fewer options' : 'More options'}
      </button>

      {showMore ? (
        <div className="quick-add-more">
          <label className="field">
            <span>Notes</span>
            <textarea
              rows="2"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes or description..."
            />
          </label>
        </div>
      ) : null}

      {error ? <div className="quick-add-error">{error}</div> : null}
      {success ? <div className="quick-add-success">Expense added</div> : null}

      <Button type="submit" disabled={saving}>
        {saving ? 'Adding...' : 'Add expense'}
      </Button>
    </form>
  )
}
