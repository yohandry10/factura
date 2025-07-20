'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ReciboData } from '../types/recibo'
import { generatePDF } from '../utils/pdfGenerator'
import { DatabaseManager } from '../lib/database'
import ReciboImpresion from './ReciboImpresion'
import { useState } from 'react'

const reciboSchema = z.object({
  sucursal: z.string().min(1, 'Sucursal es requerida'),
  fecha: z.string().min(1, 'Fecha es requerida'),
  numeroCuenta: z.string().min(10, 'Número de cuenta debe tener al menos 10 dígitos'),
  nombreCliente: z.string().min(1, 'Nombre del cliente es requerido'),
  tipoDocumento: z.string().min(1, 'Tipo de documento es requerido'),
  numeroDocumento: z.string().min(1, 'Número de documento es requerido'),
  tipoOperacion: z.string().min(1, 'Tipo de operación es requerido'),
  moneda: z.string().min(1, 'Moneda es requerida'),
  monto: z.number().min(0.01, 'Monto debe ser mayor a 0'),
  formaPago: z.string().min(1, 'Forma de pago es requerida'),
  efectivo: z.number().min(0, 'Efectivo no puede ser negativo'),
  montoDeposito: z.number().min(0, 'Monto depósito no puede ser negativo'),
  impuestoRetenido: z.number().min(0, 'Impuesto retenido no puede ser negativo'),
  observaciones: z.string().optional(),
})

export default function ReciboForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [currentRecibo, setCurrentRecibo] = useState<ReciboData | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ReciboData>({
    resolver: zodResolver(reciboSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-PE', { hour12: false }),
      moneda: 'SOL',
      tipoOperacion: 'DEPOSITO',
      tipoDocumento: 'DNI',
      formaPago: 'EFECTIVO'
    }
  })

  const monto = watch('monto')
  const efectivo = watch('efectivo')

  // Auto-calcular monto depósito
  const handleMontoChange = (value: number) => {
    setValue('monto', value)
    setValue('montoDeposito', value)
  }

  const onSubmit = async (data: ReciboData) => {
    setIsGenerating(true)
    try {
      // Actualizar fecha y hora al momento actual
      const dataConHoraActual = {
        ...data,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-PE', { hour12: false })
      }

      // Guardar operación en la base de datos y obtener número de operación
      const operacionGuardada = DatabaseManager.saveOperation(dataConHoraActual)

      // Guardar datos para impresión
      setCurrentRecibo(operacionGuardada)

      // Generar PDF con los datos completos incluyendo número de operación
      await generatePDF(operacionGuardada)

      // Mostrar mensaje de éxito
      alert(`Operación guardada exitosamente. Número: ${operacionGuardada.numeroOperacion}`)

      // Limpiar formulario
      reset()
    } catch (error) {
      console.error('Error procesando operación:', error)
      alert('Error al procesar la operación')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImprimir = () => {
    const formData = watch()
    if (!formData.monto || formData.monto <= 0) {
      alert('Por favor complete el formulario antes de imprimir')
      return
    }
    setCurrentRecibo(formData)
    setShowPrintModal(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Información del banco */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Sucursal</label>
          <input
            {...register('sucursal')}
            className="form-input"
            placeholder="Ej: LIMA CENTRO"
          />
          {errors.sucursal && <p className="text-red-500 text-sm">{errors.sucursal.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Número de Operación</label>
          <div className="form-input bg-gray-100 text-gray-600 flex items-center">
            Se generará automáticamente
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            {...register('fecha')}
            className="form-input"
          />
          {errors.fecha && <p className="text-red-500 text-sm">{errors.fecha.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Hora</label>
          <div className="form-input bg-gray-100 text-gray-600 flex items-center">
            Se generará automáticamente
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="form-group">
        <label className="form-label">Número de Cuenta</label>
        <input
          {...register('numeroCuenta')}
          className="form-input font-mono"
          placeholder="Ej: 200-3006659037-50"
        />
        {errors.numeroCuenta && <p className="text-red-500 text-sm">{errors.numeroCuenta.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Nombre del Cliente</label>
        <input
          {...register('nombreCliente')}
          className="form-input"
          placeholder="Nombre completo del cliente"
        />
        {errors.nombreCliente && <p className="text-red-500 text-sm">{errors.nombreCliente.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Tipo de Documento</label>
          <select
            {...register('tipoDocumento')}
            className="form-select"
          >
            <option value="DNI">DNI</option>
            <option value="CE">Carnet de Extranjería</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Número de Documento</label>
          <input
            {...register('numeroDocumento')}
            className="form-input"
            placeholder="Ej: 12345678"
          />
          {errors.numeroDocumento && <p className="text-red-500 text-sm">{errors.numeroDocumento.message}</p>}
        </div>
      </div>

      {/* Detalles de la operación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Tipo de Operación</label>
          <select
            {...register('tipoOperacion')}
            className="form-select"
          >
            <option value="DEPOSITO">Depósito</option>
            <option value="RETIRO">Retiro</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Moneda</label>
          <select
            {...register('moneda')}
            className="form-select"
          >
            <option value="SOL">Soles (S/)</option>
            <option value="USD">Dólares (US$)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Monto</label>
          <input
            type="number"
            step="0.01"
            {...register('monto', {
              valueAsNumber: true,
              onChange: (e) => handleMontoChange(parseFloat(e.target.value) || 0)
            })}
            className="form-input"
            placeholder="0.00"
          />
          {errors.monto && <p className="text-red-500 text-sm">{errors.monto.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Forma de Pago</label>
          <select
            {...register('formaPago')}
            className="form-select"
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="CHEQUE">Cheque</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group">
          <label className="form-label">Efectivo</label>
          <input
            type="number"
            step="0.01"
            {...register('efectivo', { valueAsNumber: true })}
            className="form-input"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Monto Depósito</label>
          <input
            type="number"
            step="0.01"
            {...register('montoDeposito', { valueAsNumber: true })}
            className="form-input"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Impuesto Retenido</label>
          <input
            type="number"
            step="0.01"
            {...register('impuestoRetenido', { valueAsNumber: true })}
            className="form-input"
            placeholder="0.00"
          />
        </div>
      </div>



      <div className="form-group">
        <label className="form-label">Observaciones</label>
        <textarea
          {...register('observaciones')}
          className="form-input resize-none"
          rows={3}
          placeholder="Observaciones adicionales..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="submit"
          disabled={isGenerating}
          className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generando...
            </>
          ) : (
            <>
              📄 Generar PDF
            </>
          )}
        </button>

        <button
          type="button"
          className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          onClick={handleImprimir}
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* Modal de impresión */}
      {showPrintModal && currentRecibo && (
        <ReciboImpresion
          data={currentRecibo}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </form>
  )
}