import { Home, Receipt, PieChart, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const tab = (path, Icon, label) => {
    const active = pathname === path
    return (
      <button
        onClick={() => navigate(path)}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-2 active:opacity-60"
      >
        <Icon size={21} strokeWidth={2.25} color={active ? '#635BFF' : '#73798C'} />
        <span className={`text-[11px] ${active ? 'text-primary font-medium' : 'text-text-secondary'}`}>
          {label}
        </span>
      </button>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-black/5 safe-bottom z-40">
      <div className="flex items-center max-w-md mx-auto">
        {tab('/', Home, 'Home')}
        {tab('/expenses', Receipt, 'Expenses')}
        {tab('/insights', PieChart, 'Insights')}
        {tab('/profile', User, 'Profile')}
      </div>
    </nav>
  )
}
