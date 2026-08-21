import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useSettings } from '../state/SettingsStore'
import { CURRENCIES } from '../lib/currency'

const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System Default' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme, currency, setCurrency } = useSettings()

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-10 safe-top min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft size={22} color="var(--color-text)" />
        </button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Appearance</h2>
      <div className="rounded-2xl bg-card shadow-sm overflow-hidden mb-8">
        {THEMES.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            className={`w-full flex items-center justify-between px-5 py-4 active:bg-black/5 ${
              i !== THEMES.length - 1 ? 'border-b border-black/5' : ''
            }`}
          >
            <span className="text-sm">{t.label}</span>
            {theme === t.key && <Check size={16} color="#635BFF" />}
          </button>
        ))}
      </div>

      <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Currency</h2>
      <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
        {CURRENCIES.map((c, i) => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={`w-full flex items-center justify-between px-5 py-4 active:bg-black/5 ${
              i !== CURRENCIES.length - 1 ? 'border-b border-black/5' : ''
            }`}
          >
            <span className="text-sm">{c.symbol} {c.label} ({c.code})</span>
            {currency === c.code && <Check size={16} color="#635BFF" />}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-secondary mt-3 px-1">
        This only changes how new totals are displayed — existing expenses keep the currency they were recorded in.
      </p>
    </div>
  )
}
