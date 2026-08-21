import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useExpenses } from '../state/ExpenseStore'
import { CATEGORIES } from '../lib/engine'
import { CURRENCIES } from '../lib/currency'

export default function ExpenseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { expenses, updateExpense, removeExpense } = useExpenses()
  const original = expenses.find((e) => e.id === id)
  const [form, setForm] = useState(original)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!original) {
    return (
      <div className="max-w-md mx-auto px-5 pt-6 safe-top">
        <p className="text-text-secondary text-sm">This expense no longer exists.</p>
        <button onClick={() => navigate('/expenses')} className="mt-4 text-primary text-sm font-medium">
          Back to Expenses
        </button>
      </div>
    )
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function save() {
    updateExpense(id, form)
    navigate('/expenses', { replace: true })
  }

  function confirmDelete() {
    removeExpense(id)
    navigate('/expenses', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-10 safe-top min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft size={22} color="var(--color-text)" />
          </button>
          <h1 className="text-lg font-semibold">Edit expense</h1>
        </div>
        <button onClick={() => setConfirmingDelete(true)} className="p-1 active:opacity-60">
          <Trash2 size={20} color="#FF6B6B" />
        </button>
      </div>

      <div className="rounded-2xl bg-card shadow-sm p-5">
        <LabeledInput label="Merchant" value={form.merchant || ''} onChange={(v) => update('merchant', v)} />
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="col-span-2">
            <LabeledInput label="Amount" value={form.amount || ''} onChange={(v) => update('amount', v)} type="number" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Currency</label>
            <select
              value={form.currencyCode || 'INR'}
              onChange={(e) => update('currencyCode', e.target.value)}
              className="w-full rounded-lg bg-bg border border-black/5 px-2 py-2.5 text-sm outline-none"
            >
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>
        <LabeledInput label="Date" value={form.date || ''} onChange={(v) => update('date', v)} type="date" />
        <LabeledInput label="Note" value={form.note || ''} onChange={(v) => update('note', v)} />
        <div className="mb-4">
          <label className="text-xs text-text-secondary mb-1 block">Category</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full rounded-lg bg-bg border border-black/5 px-3 py-2.5 text-sm outline-none"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <LabeledInput label="Subcategory" value={form.subcategory || ''} onChange={(v) => update('subcategory', v)} />
      </div>

      <button
        onClick={save}
        className="w-full mt-6 rounded-xl bg-primary text-white py-4 font-medium active:scale-[0.99] transition-transform"
      >
        Save changes
      </button>

      {confirmingDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setConfirmingDelete(false)}>
          <div
            className="w-full max-w-md mx-auto bg-card rounded-t-2xl p-6 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-1">Delete expense?</h3>
            <p className="text-sm text-text-secondary mb-5">
              Are you sure you want to delete this expense? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 py-3 rounded-xl border border-black/10 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-expense text-white text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LabeledInput({ label, value, onChange, type = 'text' }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-text-secondary mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-bg border border-black/5 px-3 py-2.5 text-sm outline-none focus:border-primary/50"
      />
    </div>
  )
}
