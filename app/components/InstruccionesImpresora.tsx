// src/app/components/InstruccionesImpresora.tsx
'use client'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function InstruccionesImpresora({ isOpen, onClose }: Props) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">📋 Instrucciones</h3>
          <button className="text-xl" onClick={onClose}>×</button>
        </div>
        {/* …contenido igual que tu versión… */}
      </div>
    </div>
  )
}
