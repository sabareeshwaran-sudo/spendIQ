// SpendIQ extraction + categorization engine.
//
// This is a deterministic, offline stand-in for the real OCR/AI pipeline
// (Phase 4 in the roadmap). It is structured so the ONLY thing that needs
// to change to go live is swapping `extractFromImage()` for a real call to
// a vision-capable model (e.g. Claude with an image block) that returns the
// same shape: { merchant, amount, currency, date, time, paymentMethod, referenceId, rawText }.
//
// Keeping the interface stable now means Phase 4 is a backend swap, not a
// frontend rewrite.

const CATEGORY_RULES = [
  { category: 'Food & Dining', subcategory: 'Food Delivery', merchants: ['swiggy', 'zomato', 'ubereats'], notes: [] },
  { category: 'Food & Dining', subcategory: 'Coffee', merchants: ['starbucks', 'blue tokai', 'third wave'], notes: ['coffee', 'cafe'] },
  { category: 'Food & Dining', subcategory: 'Snacks', merchants: [], notes: ['snack', 'snacks', 'office snacks'] },
  { category: 'Food & Dining', subcategory: 'Dining Out', merchants: ['restaurant', 'dominos', 'pizza'], notes: ['lunch', 'dinner', 'office lunch', 'food'] },
  { category: 'Groceries', subcategory: null, merchants: ['bigbasket', 'blinkit', 'zepto', 'dmart', 'more supermarket'], notes: ['grocery', 'groceries', 'grocery shopping'] },
  { category: 'Transportation', subcategory: 'Taxi', merchants: ['uber', 'ola', 'rapido'], notes: ['cab', 'taxi', 'cab to office', 'cab home'] },
  { category: 'Transportation', subcategory: 'Fuel', merchants: ['indianoil', 'hp petrol', 'bharat petroleum', 'shell'], notes: ['fuel', 'petrol', 'diesel'] },
  { category: 'Shopping', subcategory: null, merchants: ['amazon', 'flipkart', 'myntra', 'ajio'], notes: ['shopping'] },
  { category: 'Entertainment', subcategory: 'Movies', merchants: ['bookmyshow', 'pvr', 'inox'], notes: ['movie', 'movies'] },
  { category: 'Subscriptions', subcategory: null, merchants: ['netflix', 'spotify', 'hotstar', 'prime video', 'youtube premium'], notes: ['subscription', 'monthly netflix'] },
  { category: 'Bills & Utilities', subcategory: null, merchants: ['airtel', 'jio', 'bses', 'tneb', 'act fibernet'], notes: ['bill', 'recharge', 'electricity'] },
  { category: 'Health', subcategory: null, merchants: ['apollo', 'medplus', 'practo', 'pharmeasy'], notes: ['medicine', 'pharmacy', 'doctor'] },
  { category: 'Travel', subcategory: null, merchants: ['irctc', 'makemytrip', 'goibibo', 'indigo', 'redbus'], notes: ['travel', 'flight', 'train'] },
  { category: 'Education', subcategory: null, merchants: ['udemy', 'coursera'], notes: ['course', 'books'] },
  { category: 'Personal Care', subcategory: null, merchants: ['nykaa', 'urban company'], notes: ['salon', 'haircut'] },
  { category: 'Rent', subcategory: null, merchants: [], notes: ['rent'] },
  { category: 'Salary / Income', subcategory: null, merchants: [], notes: ['salary', 'income', 'credited'] },
]

function normalize(s) {
  return (s || '').toLowerCase().trim()
}

import { createWorker } from 'tesseract.js'

let workerPromise = null
function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng', 1, {
      workerPath: '/tesseract/worker.min.js',
      corePath: '/tesseract/tesseract-core-lstm.wasm.js',
      langPath: '/tesseract/',
      gzip: true,
      cacheMethod: 'none',
    })
  }
  return workerPromise
}

// Real offline OCR: runs Tesseract.js entirely on-device (no network call),
// then parses the recognized text for amount / merchant / date using
// patterns common to UPI, bank, and wallet payment screenshots.
export async function extractFromImage(file) {
  let text = ''
  try {
    const worker = await getWorker()
    const { data } = await worker.recognize(file)
    text = data?.text || ''
  } catch (err) {
    console.error('OCR failed', err)
    return {
      merchant: null, amount: null, currencyCode: 'INR',
      date: new Date().toISOString().slice(0, 10), time: null,
      paymentMethod: null, referenceId: null, ocrConfidence: 0.1, rawText: '',
    }
  }

  const amount = parseAmount(text)
  const merchant = parseMerchant(text)
  const date = parseDate(text)
  const paymentMethod = parsePaymentMethod(text)
  const referenceId = parseReferenceId(text)

  // Confidence reflects how many fields we actually managed to pull out.
  const found = [amount, merchant, date].filter(Boolean).length
  const ocrConfidence = found === 3 ? 0.9 : found === 2 ? 0.65 : found === 1 ? 0.4 : 0.15

  return {
    merchant, amount, currencyCode: 'INR', date: date || new Date().toISOString().slice(0, 10),
    time: null, paymentMethod, referenceId, ocrConfidence, rawText: text,
  }
}

function parseAmount(text) {
  // Look for ₹450, Rs. 450, INR 450.00, or a number right after "Amount"/"Paid"/"Total"
  const patterns = [
    /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:amount|paid|total)[:\s]*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      const n = parseFloat(m[1].replace(/,/g, ''))
      if (!isNaN(n) && n > 0) return n
    }
  }
  return null
}

function parseMerchant(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const patterns = [
    /(?:paid to|to|pay to|merchant)[:\s]+([A-Za-z][A-Za-z0-9&'.\- ]{2,40})/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) return m[1].trim()
  }
  // fall back: first reasonably long, mostly-alphabetic line, skipping bank/app boilerplate
  const skip = /(upi|success|transaction|payment|bank|balance|reference|txn|₹|rs\.|inr|debited|credited)/i
  for (const line of lines) {
    if (line.length >= 3 && line.length <= 40 && /[A-Za-z]{3,}/.test(line) && !skip.test(line)) {
      return line
    }
  }
  return null
}

function parseDate(text) {
  const patterns = [
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      const d = new Date(m[1])
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
    }
  }
  return null
}

function parsePaymentMethod(text) {
  if (/upi/i.test(text)) return 'UPI'
  if (/credit card/i.test(text)) return 'Credit Card'
  if (/debit card/i.test(text)) return 'Debit Card'
  if (/wallet/i.test(text)) return 'Wallet'
  if (/net banking/i.test(text)) return 'Net Banking'
  return null
}

function parseReferenceId(text) {
  const m = text.match(/(?:UPI\s*)?(?:ref|reference|transaction|txn)\.?\s*(?:id|no)?[:\s]*([A-Za-z0-9]{6,25})/i)
  return m ? m[1] : null
}

export function categorize({ merchant, note, type = 'expense' }) {
  const m = normalize(merchant)
  const n = normalize(note)

  let best = null
  let bestScore = 0

  for (const rule of CATEGORY_RULES) {
    let score = 0
    if (m && rule.merchants.some((x) => m.includes(x))) score += 0.7
    if (n && rule.notes.some((x) => n.includes(x))) score += 0.5
    if (score > bestScore) {
      bestScore = score
      best = rule
    }
  }

  if (!best) {
    if (type === 'income') {
      return { category: 'Salary / Income', subcategory: null, confidence: 0.6 }
    }
    return { category: 'Other', subcategory: null, confidence: 0.3 }
  }

  return {
    category: best.category,
    subcategory: best.subcategory,
    confidence: Math.min(0.98, 0.5 + bestScore),
  }
}

export function detectDuplicate(expense, existing) {
  return existing.find((e) => {
    if (expense.referenceId && e.referenceId && expense.referenceId === e.referenceId) return true
    const sameAmount = Number(e.amount) === Number(expense.amount)
    const sameMerchant = normalize(e.merchant) === normalize(expense.merchant)
    const sameDate = e.date === expense.date
    return sameAmount && sameMerchant && sameDate && e.id !== expense.id
  })
}

export const CATEGORIES = [
  'Food & Dining', 'Groceries', 'Transportation', 'Shopping', 'Bills & Utilities',
  'Entertainment', 'Health', 'Travel', 'Education', 'Personal Care',
  'Subscriptions', 'Rent', 'Salary / Income', 'Other',
]
