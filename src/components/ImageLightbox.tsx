import { useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { useState } from 'react'

interface Props {
  src: string
  alt: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      <div className="relative z-10 max-w-[95vw] max-h-[95vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setScale(s => Math.min(s + 0.25, 3))} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition" title="Zoom in">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={() => setScale(s => Math.max(s - 0.25, 0.5))} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition" title="Zoom out">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button onClick={() => setScale(1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition" title="Reset zoom">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-red-500/50 text-white transition ml-4" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-auto max-w-[90vw] max-h-[85vh] rounded-lg">
          <img
            src={src}
            alt={alt}
            className="max-w-none transition-transform duration-300 rounded-lg shadow-2xl"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
          />
        </div>
        <p className="text-gray-400 text-sm mt-3">{alt}</p>
      </div>
    </div>
  )
}
