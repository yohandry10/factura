'use client'

import { useState, useEffect } from 'react'
import { DatabaseManager, OperacionGuardada } from '../lib/database'
import { generatePDF } from '../utils/pdfGenerator'
import ReciboImpresion from './ReciboImpresion'

export default function HistorialOperaciones() {
  const [operaciones, setOperaciones] = useState<OperacionGuardada[]>([])
  const [stats, setStats] = useState({ totalOperaciones: 0, montoTotal: 0 })
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [selectedRecibo, setSelectedRecibo] = useState<OperacionGuardada | null>(null)

  useEffect(() => {
    cargarOperaciones()
  }, [])

  const cargarOperaciones = () => {
    const ops = DatabaseManager.getAllOperations()
    const estadisticas = DatabaseManager.getStats()
    setOperaciones(ops.reverse()) // Mostrar las más recientes primero
    setStats(estadisticas)
  }

  const regenerarPDF = async (operacion: OperacionGuardada) => {
    try {
      await generatePDF(operacion)
    } catch (error) {
      console.error('Error regenerando PDF:', error)
      alert('Error al regenerar el PDF')
    }
  }

  const abrirImpresion = (operacion: OperacionGuardada) => {
    setSelectedRecibo(operacion)
    setShowPrintModal(true)
  }

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleString('es-PE')
  }

  const formatearMonto = (monto: number, moneda: string) => {
    const simbolo = moneda === 'SOL' ? 'S/' : 'US$'
    return `${simbolo} ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Operaciones</h2>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Total Operaciones</h3>
            <p className="text-2xl font-bold text-blue-800">{stats.totalOperaciones}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Monto Total</h3>
            <p className="text-2xl font-bold text-green-800">
              S/ {stats.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {operaciones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay operaciones registradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nº Operación</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cliente</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Monto</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {operaciones.map((operacion) => (
                <tr key={operacion.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{operacion.numeroOperacion}</td>
                  <td className="px-4 py-3 text-sm">{formatearFecha(operacion.fechaCreacion)}</td>
                  <td className="px-4 py-3 text-sm">{operacion.nombreCliente}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {operacion.tipoOperacion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {formatearMonto(operacion.monto, operacion.moneda)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => regenerarPDF(operacion)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => abrirImpresion(operacion)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        🖨️ Imprimir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <button
          onClick={cargarOperaciones}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Modal de impresión */}
      {showPrintModal && selectedRecibo && (
        <ReciboImpresion
          data={selectedRecibo}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  )
}