import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, PenLine } from 'lucide-react'

export default function AddChoice() {
  const navigate = useNavigate()

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-10 safe-top min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft size={22} color="var(--color-text)" />
        </button>
        <h1 className="text-lg font-semibold">Add expense</h1>
      </div>

      <button
        onClick={() => navigate('/add')}
        className="w-full rounded-2xl bg-primary text-white p-6 flex items-center gap-4 mb-4 text-left active:scale-[0.99] transition-transform"
      >
        <Camera size={28} />
        <div>
          <p className="font-semibold">Add from Screenshot</p>
          <p className="text-white/70 text-xs mt-0.5">Upload a payment screenshot and let SpendIQ understand it</p>
        </div>
      </button>

      <button
        onClick={() => navigate('/manual')}
        className="w-full rounded-2xl bg-card border border-black/10 p-6 flex items-center gap-4 text-left active:scale-[0.99] transition-transform"
      >
        <PenLine size={26} color="#73798C" />
        <div>
          <p className="font-semibold text-text">Add Manually</p>
          <p className="text-text-secondary text-xs mt-0.5">Enter the expense yourself</p>
        </div>
      </button>
    </div>
  )
}
