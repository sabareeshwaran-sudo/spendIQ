import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, TrendingUp, Plus } from 'lucide-react'
import { useExpenses } from '../state/ExpenseStore'
import { useSettings } from '../state/SettingsStore'
import { getInsights, formatPeriodLabel } from '../lib/insights'
import { formatMoney } from '../lib/currency'

const PERIODS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
]

export default function Insights() {
  const { expenses } = useExpenses()
  const { currency } = useSettings()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('daily')

  const data = useMemo(() => getInsights(expenses, period), [expenses, period])

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-28 safe-top min-h-screen">
      <h1 className="text-2xl font-semibold mb-1">Insights</h1>
      <p className="text-text-secondary text-sm mb-5">{formatPeriodLabel(period)}</p>

      <div className="flex rounded-xl bg-card p-1 mb-6 border border-black/5">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              period === p.key ? 'bg-primary text-white' : 'text-text-secondary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {data.count === 0 ? (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <Sparkles size={28} color="#73798C" />
          <p className="text-text-secondary text-sm max-w-[220px]">
            Start adding expenses to see your spending insights.
          </p>
          <button
            onClick={() => navigate('/add-choice')}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-card shadow-sm p-4">
              <p className="text-xs text-text-secondary mb-1">Total spent</p>
              <p className="text-lg font-semibold">{formatMoney(data.total, currency)}</p>
            </div>
            <div className="rounded-xl bg-card shadow-sm p-4">
              <p className="text-xs text-text-secondary mb-1">Expenses</p>
              <p className="text-lg font-semibold">{data.count}</p>
            </div>
          </div>

          {data.topCategory && (
            <div className="rounded-xl bg-card shadow-sm p-4 mb-3">
              <p className="text-xs text-text-secondary mb-1">Top category</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{data.topCategory}</p>
                <p className="text-sm font-semibold text-expense">{formatMoney(data.topCategoryAmount, currency)}</p>
              </div>
            </div>
          )}

          {data.largest && (
            <div className="rounded-xl bg-card shadow-sm p-4 mb-3">
              <p className="text-xs text-text-secondary mb-1">Largest expense</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{data.largest.merchant || 'Unknown'}</p>
                <p className="text-sm font-semibold text-expense">{formatMoney(data.largest.amount, currency)}</p>
              </div>
            </div>
          )}

          {data.topMerchant && (
            <div className="rounded-xl bg-card shadow-sm p-4 mb-3">
              <p className="text-xs text-text-secondary mb-1">Most frequent merchant</p>
              <p className="text-sm font-medium">{data.topMerchant}</p>
            </div>
          )}

          {data.categoryEntries.length > 1 && (
            <div className="rounded-xl bg-card shadow-sm p-4 mb-3">
              <p className="text-xs text-text-secondary mb-2">Category breakdown</p>
              <div className="space-y-2">
                {data.categoryEntries.slice(0, 5).map(([cat, amt]) => {
                  const pct = data.total > 0 ? Math.round((amt / data.total) * 100) : 0
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text">{cat}</span>
                        <span className="text-text-secondary">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {data.notes.length > 0 && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={15} color="#635BFF" />
                <p className="text-xs font-medium text-primary">SpendIQ Insight</p>
              </div>
              {data.notes.map((n, i) => (
                <p key={i} className="text-xs text-text mb-1 last:mb-0">{n}</p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
