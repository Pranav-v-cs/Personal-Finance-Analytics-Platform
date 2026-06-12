export function getCurrency() {
  try {
    return localStorage.getItem('currency') || 'USD'
  } catch {
    return 'USD'
  }
}

export function formatCurrency(value, currency) {
  const cur = currency || getCurrency()
  const number = Number(value || 0)
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: 2,
    }).format(number)
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number)
  }
}

export function formatCompact(value, currency) {
  const cur = currency || getCurrency()
  const number = Number(value || 0)
  if (number === 0) return formatCurrency(0, cur)
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur,
      notation: 'compact',
      maximumFractionDigits: 1,
    })
    return formatter.format(number)
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(number)
  }
}

export function currencyTickFormatter(currency = 'USD') {
  return (value) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 0,
      }).format(value)
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        notation: 'compact',
        maximumFractionDigits: 0,
      }).format(value)
    }
  }
}

export function getCurrencySymbol(currency) {
  const cur = currency || getCurrency()
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 0 })
      .format(0)
      .replace(/[\d,.\s]/g, '')
      .trim()
  } catch {
    return cur
  }
}

export function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function formatMonthLabel(month) {
  if (!month) return 'N/A'
  const date = new Date(`${month}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return month
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)
}

export function formatDateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildMonthSeries(rows = [], months = 12) {
  const map = new Map(rows.map((row) => [row.month, Number(row.total_amount ?? row.total ?? 0)]))
  const series = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(Date.UTC(currentYear, currentMonth - index, 1))
    const month = date.toISOString().slice(0, 7)
    series.push({
      month,
      label: formatMonthLabel(month),
      total: map.get(month) || 0,
    })
  }

  return series
}
