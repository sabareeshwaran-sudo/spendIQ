import { createContext, useContext, useEffect, useState } from 'react'

const SettingsContext = createContext(null)
const KEY = 'spendiq_settings_v1'
const PROFILE_KEY = 'spendiq_profile_v1'

function getSystemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : { theme: 'system', currency: 'INR' }
    } catch {
      return { theme: 'system', currency: 'INR' }
    }
  })

  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      return raw ? JSON.parse(raw) : { name: '', email: '' }
    } catch {
      return { name: '', email: '' }
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings))
    const resolved = settings.theme === 'system'
      ? (getSystemPrefersDark() ? 'dark' : 'light')
      : settings.theme
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [settings])

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }, [profile])

  function setTheme(theme) {
    setSettings((s) => ({ ...s, theme }))
  }

  function setCurrency(currency) {
    setSettings((s) => ({ ...s, currency }))
  }

  function updateProfile(patch) {
    setProfile((p) => ({ ...p, ...patch }))
  }

  return (
    <SettingsContext.Provider value={{ ...settings, setTheme, setCurrency, profile, updateProfile }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
