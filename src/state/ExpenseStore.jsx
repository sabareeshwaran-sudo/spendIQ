import { createContext, useContext, useEffect, useState } from 'react'

const ExpenseContext = createContext(null)
const STORAGE_KEY = 'spendiq_expenses_v1'

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [draft, setDraft] = useState(null) // in-flight transaction being reviewed

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  }, [expenses])

  function addExpense(expense) {
    const withId = { ...expense, id: expense.id || crypto.randomUUID(), createdAt: Date.now() }
    setExpenses((prev) => [withId, ...prev])
    return withId
  }

  function removeExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  function updateExpense(id, patch) {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  const value = { expenses, addExpense, removeExpense, updateExpense, draft, setDraft }
  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider')
  return ctx
}
