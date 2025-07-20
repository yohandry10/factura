'use client'

import { ReciboData } from '../types/recibo'

interface Props {
  data: ReciboData
}

export default function ReciboPreview({ data }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="receipt-paper p-6 font-mono text-sm max-w-md mx-auto">
      {/* Header con logo placeholder */}
      <div className="text-center mb-4">
        <div className="w-16 h-8 bg-interbank-blue mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold">
          LOGO
        </div>
        <div className="text-lg font-bold">Interbank</div>
      </div>

      {/* Información de sucursal y operación */}
      <div className="border-b border-gray-300 pb-2 mb-3">
        <div className="flex justify-between">
          <span>SUC: {data.sucursal}</span>
          <span>OP: {data.numeroOperacion}</span>
        </div>
        <div className="flex justify-between">
          <span>{formatDate(data.fecha)}</span>
          <span>{data.hora}</span>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="mb-4">
        <div className="mb-1">
          <span className="font-bold">PRODUCTO:</span> CUENTA CORRIENTE {data.moneda}
        </div>
        <div className="mb-1">
          <span className="font-bold">CUENTA:</span> {data.numeroCuenta}
        </div>
        <div className="mb-1">
          <span className="font-bold">CLIENTE:</span> {data.nombreCliente}
        </div>
        <div>
          <span className="font-bold">{data.tipoDocumento}:</span> {data.numeroDocumento}
        </div>
      </div>

      {/* Tipo de operación */}
      <div className="text-center font-bold text-lg mb-4 border-y border-gray-300 py-2">
        {data.tipoOperacion}
      </div>

      {/* Detalles de la transacción */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>IMPORTE {data.tipoOperacion}:</span>
          <span className="font-bold">{formatCurrency(data.monto)}</span>
        </div>
        <div className="flex justify-between">
          <span>MONEDA {data.tipoOperacion}:</span>
          <span>{data.moneda}</span>
        </div>
      </div>

      {/* Forma de pago */}
      <div className="border-t border-gray-300 pt-2 mb-4">
        <div className="font-bold mb-2">FORMA DE PAGO:</div>
        <div className="flex justify-between">
          <span>EFECT S/:</span>
          <span>{formatCurrency(data.efectivo)}</span>
        </div>
        <div className="flex justify-between">
          <span>RECIBIDO S/:</span>
          <span>{formatCurrency(data.montoDeposito)}</span>
        </div>
      </div>

      {/* Impuestos */}
      {data.impuestoRetenido > 0 && (
        <div className="mb-4">
          <div className="flex justify-between">
            <span>IMPUESTO RETENIDO S/:</span>
            <span>{formatCurrency(data.impuestoRetenido)}</span>
          </div>
          <div className="text-xs">
            C.RETENCION - REGIMEN GENERAL RENTA
          </div>
        </div>
      )}

      {/* Saldo disponible */}
      <div className="border-t border-gray-300 pt-2 mb-4">
        <div className="flex justify-between font-bold">
          <span>SALDO DISPONIBLE:</span>
          <span>{formatCurrency(data.saldoDisponible)}</span>
        </div>
      </div>

      {/* Observaciones */}
      {data.observaciones && (
        <div className="mb-4 text-xs">
          <div className="font-bold">OBSERVACIONES:</div>
          <div>{data.observaciones}</div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs border-t border-gray-300 pt-2">
        <div>COMPROBANTE DE OPERACIÓN</div>
        <div>CONSERVE ESTE DOCUMENTO</div>
        <div className="mt-2">
          Operación: {data.numeroOperacion} | {formatDate(data.fecha)} {data.hora}
        </div>
      </div>

      {/* Botón de impresión */}
      <div className="mt-6 text-center">
        <button
          onClick={() => window.print()}
          className="bg-interbank-blue text-white px-6 py-2 rounded hover:bg-blue-800 transition-colors no-print"
        >
          Imprimir Recibo
        </button>
      </div>
    </div>
  )
}