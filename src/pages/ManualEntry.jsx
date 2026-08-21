import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useExpenses } from '../state/ExpenseStore'
import { CATEGORIES } from '../lib/engine'
import { CURRENCIES } from '../lib/currency'

export default function ManualEntry() {
  const navigate = useNavigate()
  const { addExpense } = useExpenses()
  const [form, setForm] = useState({
    type: 'expense', merchant: '', amount: '', currencyCode: 'INR',
    date: new Date().toISOString().slice(0, 10),
    category: 'Other', subcategory: '', note: '',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function save() {
    if (!form.merchant || !form.amount) return
    addExpense({ ...form, confidence: 1, manual: true })
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-10 safe-top min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft size={22} color="var(--color-text)" />
        </button>
        <h1 className="text-lg font-semibold">Add manually</h1>
      </div>

      <p className="text-xs text-text-secondary mb-4">
        Use this for cash expenses or when a screenshot isn't available.
      </p>

      <div className="rounded-2xl bg-card shadow-sm p-5">
        <LabeledInput label="Merchant / Description" value={form.merchant} onChange={(v) => update('merchant', v)} required />

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="col-span-2">
            <LabeledInput label="Amount" value={form.amount} onChange={(v) => update('amount', v)} type="number" required />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Currency</label>
            <select
              value={form.currencyCode}
              onChange={(e) => update('currencyCode', e.target.value)}
              className="w-full rounded-lg bg-bg border border-black/5 px-2 py-2.5 text-sm outline-none"
            >
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>

        <LabeledInput label="Date" value={form.date} onChange={(v) => update('date', v)} type="date" />
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
        <LabeledInput label="Note (optional)" value={form.note} onChange={(v) => update('note', v)} />
      </div>

      <button
        onClick={save}
        disabled={!form.merchant || !form.amount}
        className="w-full mt-6 rounded-xl bg-primary text-white py-4 font-medium disabled:opacity-40 active:scale-[0.99] transition-transform"
      >
        Save expense
      </button>
    </div>
  )
}

function LabeledInput({ label, value, onChange, type = 'text', required }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-text-secondary mb-1 block">
        {label}{required ? <span className="text-expense"> *</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-bg border border-black/5 px-3 py-2.5 text-sm outline-none focus:border-primary/50"
      />
    </div>
  )
}
