import {
  isSameDay, isSameWeek, isSameMonth, isSameYear,
  subDays, subWeeks, subMonths, subYears, format,
} from 'date-fns'

const PERIOD_CONFIG = {
  daily: { isSame: isSameDay, shift: subDays, label: 'day' },
  weekly: { isSame: (a, b) => isSameWeek(a, b, { weekStartsOn: 1 }), shift: subWeeks, label: 'week' },
  monthly: { isSame: isSameMonth, shift: subMonths, label: 'month' },
  yearly: { isSame: isSameYear, shift: subYears, label: 'year' },
}

function statsFor(expenses, refDate, period) {
  const { isSame } = PERIOD_CONFIG[period]
  const inPeriod = expenses.filter((e) => isSame(new Date(e.date), refDate))

  const total = inPeriod.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const count = inPeriod.length

  const byCategory = {}
  for (const e of inPeriod) {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount || 0)
  }
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const topCategory = categoryEntries[0]?.[0] || null
  const topCategoryAmount = categoryEntries[0]?.[1] || 0

  const largest = inPeriod.reduce((max, e) => (Number(e.amount) > Number(max?.amount || 0) ? e : max), null)

  const merchantCounts = {}
  for (const e of inPeriod) {
    if (!e.merchant) continue
    merchantCounts[e.merchant] = (merchantCounts[e.merchant] || 0) + 1
  }
  const topMerchant = Object.entries(merchantCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return { total, count, topCategory, topCategoryAmount, largest, topMerchant, categoryEntries, entries: inPeriod }
}

export function getInsights(expenses, period, refDate = new Date()) {
  const { shift, label } = PERIOD_CONFIG[period]
  const current = statsFor(expenses, refDate, period)
  const previous = statsFor(expenses, shift(refDate, 1), period)

  let comparison = null
  if (previous.total > 0 && current.total > 0) {
    const pctChange = Math.round(((current.total - previous.total) / previous.total) * 100)
    comparison = { pctChange, previousTotal: previous.total, label }
  }

  const notes = []
  if (current.count === 0) {
    notes.push(null) // handled as empty state by the UI
  } else {
    if (current.topCategory) {
      const pct = current.total > 0 ? Math.round((current.topCategoryAmount / current.total) * 100) : 0
      notes.push(`${current.topCategory} was your biggest spending area this ${label} at ${pct}% of the total.`)
    }
    if (comparison) {
      const dir = comparison.pctChange >= 0 ? 'more' : 'less'
      notes.push(`You spent ${Math.abs(comparison.pctChange)}% ${dir} than the previous ${label}.`)
    }
  }

  return { ...current, comparison, notes: notes.filter(Boolean) }
}

export function formatPeriodLabel(period, date = new Date()) {
  switch (period) {
    case 'daily': return format(date, 'd MMM yyyy')
    case 'weekly': return `Week of ${format(date, 'd MMM')}`
    case 'monthly': return format(date, 'MMMM yyyy')
    case 'yearly': return format(date, 'yyyy')
    default: return ''
  }
}
