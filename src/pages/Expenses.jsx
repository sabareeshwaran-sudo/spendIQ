import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { useExpenses } from '../state/ExpenseStore'
import { useSettings } from '../state/SettingsStore'
import { formatMoney } from '../lib/currency'

function groupLabel(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Expenses() {
  const { expenses } = useExpenses()
  const { currency } = useSettings()
  const navigate = useNavigate()

  const groups = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
    const map = new Map()
    for (const e of sorted) {
      const label = groupLabel(e.date)
      if (!map.has(label)) map.set(label, [])
      map.get(label).push(e)
    }
    return Array.from(map.entries())
  }, [expenses])

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-28 safe-top min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Expenses</h1>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 gap-2">
          <Receipt size={28} color="#73798C" />
          <p className="text-text-secondary text-sm">No expenses recorded yet.</p>
        </div>
      ) : (
        groups.map(([label, items]) => (
          <div key={label} className="mb-6">
            <h2 className="text-sm font-medium text-text-secondary mb-2">{label}</h2>
            <ul className="space-y-2">
              {items.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => navigate(`/expense/${e.id}`)}
                    className="w-full bg-card rounded-xl p-4 flex items-center justify-between shadow-sm text-left active:scale-[0.99] transition-transform"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-text text-sm truncate">{e.merchant || 'Unknown'}</p>
                      <p className="text-text-secondary text-xs mt-0.5 truncate">
                        {e.category}{e.subcategory ? ` · ${e.subcategory}` : ''}
                      </p>
                    </div>
                    <p className="font-semibold text-expense text-sm shrink-0">
                      {formatMoney(e.amount, e.currencyCode || currency)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
