import { formatDateInput } from './format'

export function parseExpenseDescription(description = '') {
  const [title = '', ...rest] = String(description).split('\n')
  return {
    title: title.trim(),
    notes: rest.join('\n').trim(),
  }
}

export function composeExpenseDescription(title, notes) {
  const cleanTitle = String(title || '').trim()
  const cleanNotes = String(notes || '').trim()
  return cleanNotes ? `${cleanTitle}\n${cleanNotes}` : cleanTitle
}

export function adaptExpense(expense) {
  const parsed = parseExpenseDescription(expense.description)
  return {
    ...expense,
    title: parsed.title,
    notes: parsed.notes,
    date: formatDateInput(expense.transaction_date),
    amount: Number(expense.amount || 0),
  }
}

export function toExpensePayload(form) {
  return {
    amount: Number(form.amount),
    category: form.category,
    description: composeExpenseDescription(form.title, form.notes),
    transaction_date: form.date ? new Date(`${form.date}T12:00:00`).toISOString() : null,
  }
}
