import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react'
import { useExpenses } from '../state/ExpenseStore'
import { CATEGORIES, detectDuplicate } from '../lib/engine'
import { CURRENCIES, formatMoney } from '../lib/currency'

export default function Confirm() {
  const navigate = useNavigate()
  const { draft, setDraft, addExpense, expenses } = useExpenses()
  const [form, setForm] = useState(draft)
  const [dupWarning, setDupWarning] = useState(null)

  useEffect(() => {
    if (!draft) navigate('/add', { replace: true })
  }, [draft, navigate])

  if (!form) return null

  const confidencePct = Math.round((form.confidence ?? 0.5) * 100)
  const lowConfidence = confidencePct < 70

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleConfirm() {
    if (!form.amount || !form.merchant) {
      // Guard: don't let an unverified transaction save silently
      return
    }
    const dup = detectDuplicate(form, expenses)
    if (dup && !dupWarning) {
      setDupWarning(dup)
      return
    }
    addExpense(form)
    setDraft(null)
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-10 safe-top min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft size={22} color="var(--color-text)" />
        </button>
        <h1 className="text-lg font-semibold">Review</h1>
      </div>

      <div className="rounded-2xl bg-card shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} color="#35D0BA" />
          <p className="text-sm font-medium text-text">SpendIQ understood this</p>
        </div>

        <Field label="Merchant" value={form.merchant || ''} onChange={(v) => update('merchant', v)} placeholder="Enter merchant name" required />

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="col-span-2">
            <Field label="Amount spent" value={form.amount || ''} onChange={(v) => update('amount', v)} type="number" placeholder="0.00" required />
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
        <Field label="Date" value={form.date || ''} onChange={(v) => update('date', v)} type="date" required />
        <Field label="Note" value={form.note || ''} onChange={(v) => update('note', v)} placeholder="e.g. office lunch, coffee" />

        <div className="mb-4">
          <label className="text-xs text-text-secondary mb-1 block">Category</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full rounded-lg bg-bg border border-black/5 px-3 py-2.5 text-sm outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {form.subcategory && (
          <Field label="Subcategory" value={form.subcategory} onChange={(v) => update('subcategory', v)} />
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
          <span className="text-xs text-text-secondary">Confidence</span>
          <span className={`text-sm font-semibold ${lowConfidence ? 'text-insight' : 'text-ai'}`}>
            {confidencePct}%
          </span>
        </div>
      </div>

      {lowConfidence && (
        <div className="rounded-xl bg-insight/10 border border-insight/30 px-4 py-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={16} color="#FFC857" className="mt-0.5 shrink-0" />
          <p className="text-xs text-text">Please verify this information — SpendIQ wasn't fully confident about this transaction.</p>
        </div>
      )}

      {dupWarning && (
        <div className="rounded-xl bg-expense/10 border border-expense/30 px-4 py-3 mb-4">
          <p className="text-xs text-text mb-1 font-medium">This transaction may already exist</p>
          <p className="text-xs text-text-secondary">
            {dupWarning.merchant} · {formatMoney(dupWarning.amount, dupWarning.currencyCode)} · {dupWarning.date}
          </p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        className="w-full rounded-xl bg-primary text-white py-4 font-medium active:scale-[0.99] transition-transform"
      >
        {dupWarning ? 'Save anyway' : 'Confirm expense'}
      </button>

      <button
        onClick={() => { setDraft(null); navigate('/add', { replace: true }) }}
        className="w-full mt-3 text-center text-sm text-text-secondary py-2"
      >
        Discard
      </button>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-text-secondary mb-1 block">
        {label}{required && !value ? <span className="text-expense"> · required</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-bg border border-black/5 px-3 py-2.5 text-sm outline-none focus:border-primary/50"
      />
    </div>
  )
}
