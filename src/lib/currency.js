export const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
]

export function symbolFor(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code || ''
}

export function formatMoney(amount, code = 'INR') {
  const symbol = symbolFor(code)
  const n = Number(amount || 0)
  return `${symbol}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}
