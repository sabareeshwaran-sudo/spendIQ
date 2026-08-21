import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Receipt, Sparkles } from 'lucide-react'
import { useExpenses } from '../state/ExpenseStore'
import { useSettings } from '../state/SettingsStore'
import { formatMoney } from '../lib/currency'
import { getInsights } from '../lib/insights'

export default function Home() {
  const { expenses } = useExpenses()
  const { currency, profile } = useSettings()
  const navigate = useNavigate()

  const today = useMemo(() => getInsights(expenses, 'daily'), [expenses])
  const recent = useMemo(() => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [expenses])

  const greeting = profile?.name ? `Hi, ${profile.name.split(' ')[0]}` : 'SpendIQ'

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-28 safe-top">
      <div className="mb-6">
        <p className="text-text-secondary text-sm">{greeting}</p>
        <h1 className="text-2xl font-semibold text-text">Understand your expenses.</h1>
      </div>

      <button
        onClick={() => navigate('/add-choice')}
        className="w-full rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-6 flex flex-col items-center gap-2 mb-6 active:scale-[0.99] transition-transform"
      >
        <Camera size={26} color="#635BFF" />
        <span className="text-primary font-medium text-sm">+ Add Expense</span>
        <span className="text-text-secondary text-xs">Don't type it — let SpendIQ understand it</span>
      </button>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-text-secondary">Recent Expenses</h2>
        {expenses.length > 0 && (
          <button onClick={() => navigate('/expenses')} className="text-xs text-primary font-medium">
            View all
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10 gap-2 mb-6">
          <Receipt size={30} color="#73798C" />
          <p className="text-text-secondary text-sm">No expenses yet.<br />Upload your first screenshot to get started.</p>
        </div>
      ) : (
        <ul className="space-y-2 mb-6">
          {recent.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => navigate(`/expense/${e.id}`)}
                className="w-full bg-card rounded-xl p-4 flex items-center justify-between shadow-sm text-left active:scale-[0.99] transition-transform"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text text-sm truncate">{e.merchant || 'Unknown'}</p>
                  <p className="text-text-secondary text-xs mt-0.5 truncate">{e.category}</p>
                </div>
                <p className="font-semibold text-expense text-sm shrink-0">
                  {formatMoney(e.amount, e.currencyCode || currency)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {today.count > 0 && today.notes.length > 0 && (
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} color="#635BFF" />
            <p className="text-xs font-medium text-primary">SpendIQ Insight</p>
          </div>
          <p className="text-xs text-text">{today.notes[0]}</p>
        </div>
      )}
    </div>
  )
}
