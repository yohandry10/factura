'use client'

import { useState } from 'react'
import ReciboForm from './components/ReciboForm'
import HistorialOperaciones from './components/HistorialOperaciones'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'formulario' | 'historial'>('formulario')

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Sistema de Facturación
        </h1>
        <p className="text-gray-600">Generación y gestión de comprobantes de pago</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('formulario')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'formulario'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            📝 Nueva Operación
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'historial'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            📊 Historial
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'formulario' ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <ReciboForm />
        </div>
      ) : (
        <HistorialOperaciones />
      )}
    </div>
  )
}