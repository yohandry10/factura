'use client'

import { ReciboData } from '../types/recibo'

interface Props {
  data: ReciboData
  onClose: () => void
}

export default function ReciboImpresion({ data, onClose }: Props) {
  const handleImprimir = () => {
    // Obtener el contenido del recibo
    const reciboElement = document.querySelector('.recibo-impresion')
    if (!reciboElement) return
    
    // Crear contenido HTML simple para imprimir
    const printContent = `
      <html>
        <head>
          <title>Recibo</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 10px; 
              line-height: 1.2; 
              margin: 0; 
              padding: 10px; 
              width: 80mm;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            @page { size: 80mm auto; margin: 5mm; }
          </style>
        </head>
        <body>
          ${reciboElement.innerHTML}
        </body>
      </html>
    `
    
    // Crear ventana temporal para imprimir
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const formatearMonto = (monto: number) => {
    return monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
      <div className="bg-white p-4 rounded-lg max-w-md">
        <div className="flex justify-between items-center mb-4 no-print">
          <h3 className="text-lg font-bold">Vista de Impresión</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        {/* Recibo único - se ve en pantalla y se imprime */}
        <div id={`recibo-impresion-${Date.now()}`} className="recibo-impresion recibo-termal bg-white p-4 font-mono text-xs border border-gray-300">
          <div className="text-center mb-3">
            <img 
              src="/interbank.png" 
              alt="Interbank" 
              className="h-8 w-auto mx-auto"
            />
          </div>
          
          <div className="text-xs mb-2 text-center">
            ------------------------------------
          </div>
          
          <div className="text-xs mb-1">
            {data.sucursal} TLF 216-045998
          </div>
          <div className="text-xs mb-1">
            {data.fecha?.replace(/-/g, '/')} {data.hora}
          </div>
          <div className="text-xs mb-2">
            NRO. OPE {data.numeroOperacion || '000001'}
          </div>
          
          <div className="text-xs mb-1">
            TARJ: NRO****************{data.numeroCuenta?.slice(-2)}
          </div>
          <div className="text-xs mb-3">
            T.DOC: {data.tipoDocumento}
          </div>
          
          <div className="text-xs mb-1">PRODUCTO: CUENTA CORRIENTE S/N</div>
          <div className="text-xs mb-1">CUENTA: {data.numeroCuenta}</div>
          <div className="text-xs mb-3">DOC: {data.numeroDocumento}</div>
          
          <div className="text-xs font-bold mb-2">{data.tipoOperacion}</div>
          
          <div className="text-xs mb-1">
            IMPORTE {data.tipoOperacion}          S/ {formatearMonto(data.monto)}
          </div>
          <div className="text-xs mb-3">
            MONEDA {data.tipoOperacion}    {data.moneda}
          </div>
          
          <div className="text-xs mb-2 text-center">
            ------------------------------------
          </div>
          
          <div className="text-xs mb-1">FORMA DE PAGO</div>
          <div className="text-xs mb-3">
            {data.formaPago}: S/ {formatearMonto(data.efectivo || data.monto)}
          </div>
          
          {data.impuestoRetenido && data.impuestoRetenido > 0 && (
            <>
              <div className="text-xs mb-1">
                IMPUESTO RETENIDO: S/ {formatearMonto(data.impuestoRetenido)}
              </div>
              <div className="text-xs mb-3">
                C.DETRACCION - VALIDADO SUNAT/PAGO
              </div>
            </>
          )}
          
          <div className="text-xs text-center">
            ------------------------------------
          </div>
          
          <div className="text-xs text-center mt-2">
            GRACIAS POR SU PREFERENCIA
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 no-print">
          <button
            onClick={handleImprimir}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}