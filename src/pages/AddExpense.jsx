import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Sparkles, X, Check } from 'lucide-react'
import { useExpenses } from '../state/ExpenseStore'
import { extractFromImage, categorize } from '../lib/engine'

export default function AddExpense() {
  const navigate = useNavigate()
  const { setDraft } = useExpenses()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [note, setNote] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function clearFile() {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function analyze() {
    if (!file) return
    setAnalyzing(true)
    const extracted = await extractFromImage(file)
    const cat = categorize({ merchant: extracted.merchant, note })

    setDraft({
      ...extracted,
      type: 'expense',
      note,
      category: cat.category,
      subcategory: cat.subcategory,
      confidence: Math.min(extracted.ocrConfidence + cat.confidence, 1) / 2 + 0.3,
      previewUrl: preview,
    })
    setAnalyzing(false)
    navigate('/confirm')
  }

  if (analyzing) {
    return (
      <div className="max-w-md mx-auto px-5 pt-6 pb-10 safe-top min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <Sparkles size={26} color="#635BFF" className="animate-pulse" />
        </div>
        <h2 className="text-base font-semibold mb-6">Analyzing your expense…</h2>
        <div className="space-y-3 text-sm text-text-secondary">
          <p className="flex items-center gap-2"><Check size={14} color="#35D0BA" /> Reading payment details</p>
          <p className="flex items-center gap-2"><Check size={14} color="#35D0BA" /> Understanding your note</p>
          <p className="flex items-center gap-2"><Check size={14} color="#35D0BA" /> Finding the right category</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-10 safe-top min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft size={22} color="var(--color-text)" />
        </button>
        <h1 className="text-lg font-semibold">Add from screenshot</h1>
      </div>

      <p className="text-sm text-text-secondary mb-2">Payment screenshot</p>

      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-primary/30 bg-card flex flex-col items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <ImagePlus size={30} color="#635BFF" />
          <span className="text-primary text-sm font-medium">Choose from gallery</span>
          <span className="text-text-secondary text-xs">UPI / bank / wallet payment confirmation</span>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Payment screenshot" className="w-full max-h-80 object-contain bg-card" />
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
          >
            <X size={16} color="white" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <p className="text-sm text-text-secondary mt-6 mb-2">Note <span className="text-text-secondary/60">(optional)</span></p>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. office lunch, coffee, cab to office"
        className="w-full rounded-xl bg-card border border-black/5 px-4 py-3 text-sm outline-none focus:border-primary/50"
      />

      <button
        onClick={analyze}
        disabled={!file}
        className="w-full mt-8 rounded-xl bg-primary text-white py-4 font-medium flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.99] transition-transform"
      >
        <Sparkles size={18} />
        Analyze
      </button>

      <button
        onClick={() => navigate('/manual')}
        className="w-full mt-3 text-center text-sm text-text-secondary py-2"
      >
        Enter manually instead
      </button>
    </div>
  )
}
