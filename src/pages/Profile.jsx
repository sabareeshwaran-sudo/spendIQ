import { useNavigate } from 'react-router-dom'
import { ChevronRight, Settings as SettingsIcon, Info } from 'lucide-react'
import { useSettings } from '../state/SettingsStore'

export default function Profile() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useSettings()

  const initial = (profile.name || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-28 safe-top min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary text-2xl font-semibold">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <input
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            placeholder="Your name"
            className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-text-secondary/50"
          />
          <input
            value={profile.email}
            onChange={(e) => updateProfile({ email: e.target.value })}
            placeholder="email@example.com"
            className="w-full bg-transparent text-sm text-text-secondary outline-none placeholder:text-text-secondary/50"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-sm overflow-hidden mb-4">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center justify-between px-5 py-4 active:bg-black/5"
        >
          <div className="flex items-center gap-3">
            <SettingsIcon size={18} color="#73798C" />
            <span className="text-sm">Settings</span>
          </div>
          <ChevronRight size={16} color="#73798C" />
        </button>
      </div>

      <div className="rounded-2xl bg-card shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <Info size={16} color="#73798C" />
          <span className="text-sm font-medium">About SpendIQ</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          SpendIQ helps you record expenses in seconds — upload a payment screenshot and let
          on-device AI understand the amount, merchant, and category, or add it manually
          whenever you'd rather. All your data stays on this device.
        </p>
      </div>
    </div>
  )
}
