import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ExpenseProvider } from './state/ExpenseStore'
import { SettingsProvider } from './state/SettingsStore'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Expenses from './pages/Expenses'
import ExpenseDetail from './pages/ExpenseDetail'
import AddChoice from './pages/AddChoice'
import AddExpense from './pages/AddExpense'
import Confirm from './pages/Confirm'
import ManualEntry from './pages/ManualEntry'
import Insights from './pages/Insights'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

const NO_NAV_ROUTES = ['/add-choice', '/add', '/confirm', '/manual', '/settings']

function Shell() {
  const { pathname } = useLocation()
  const hideNav = NO_NAV_ROUTES.includes(pathname) || pathname.startsWith('/expense/')

  return (
    <div className="min-h-screen bg-bg">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expense/:id" element={<ExpenseDetail />} />
        <Route path="/add-choice" element={<AddChoice />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/manual" element={<ManualEntry />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <ExpenseProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </ExpenseProvider>
    </SettingsProvider>
  )
}
