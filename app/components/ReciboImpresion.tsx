'use client'

import { useState } from 'react'
import { ReciboData } from '@/types/recibo'
import InstruccionesImpresora from './InstruccionesImpresora'

interface Props {
  data: ReciboData
  onClose: () => void
}

export default function ReciboImpresion({ data, onClose }: Props) {
  const [showHelp, setShowHelp] = useState(false)

  /* ---------- Impresión PDF / diálogo ---------- */
  const handleImprimirNormal = () => {
    const recibo = document.querySelector('.recibo-impresion')
    if (!recibo) return

    const html = `
      <html>
        <head>
          <title>Recibo</title>
          <style>
            /* Hoja térmica 80 mm sin márgenes físicos */
            @page { size: 80mm auto; margin: 0; }

            body {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              line-height: 1.35;
              margin: 0;
              padding-left: 4mm;          /* margen software 4 mm */
              width: 80mm;
            }

            img   { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            .tc   { text-align: center; }
            .bold { font-weight: bold; }

            .wrapper { width: 80mm; margin: 0 auto; }
          </style>
        </head>
        <body><div class="wrapper">${recibo.innerHTML}</div></body>
      </html>
    `

    const w = window.open('', '_blank', 'width=440,height=680')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.onload = () => { w.print(); w.close() }
  }

  const f = (n: number) =>
    n.toLocaleString('es-PE', { minimumFractionDigits: 2 })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
      <div className="bg-white p-6 rounded-lg max-w-lg">
        {/* encabezado */}
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-bold">Vista de impresión</h3>
          <div className="flex gap-3">
            <button className="text-blue-600 text-sm" onClick={() => setShowHelp(true)}>
              ❓ Ayuda
            </button>
            <button className="text-xl" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Ticket visible / imprimible */}
        <div
          className="recibo-impresion font-mono text-[14px] leading-[1.35] bg-white px-6 py-4 border"
          style={{ width: '80mm', maxWidth: '80mm', paddingLeft: '4mm' }}  /* margen 4 mm */
        >
          <div className="tc mb-4">
            <img src="/interbank.png" alt="Interbank" className="h-16 mx-auto" />
          </div>

          <div className="tc">------------------------------------</div>

          <div>{data.sucursal} TLF 216‑045998</div>
          <div>{data.fecha.replace(/-/g, '/')} {data.hora}</div>
          <div>NRO. OPE {data.numeroOperacion}</div>

          <br />

          <div>TARJ: NRO****************{data.numeroCuenta.slice(-2)}</div>
          <div>T.DOC: {data.tipoDocumento}</div>

          <br />

          <div>CUENTA: {data.numeroCuenta}</div>
          <div>DOC: {data.numeroDocumento}</div>

          <br />

          <div className="bold">{data.tipoOperacion}</div>
          <div>IMPORTE: S/ {f(data.monto)}</div>
          <div>MONEDA {data.tipoOperacion}: {data.moneda}</div>

          <br />

          <div className="tc">------------------------------------</div>
          <div>FORMA DE PAGO {data.formaPago}</div>
          <div>Efectivo: S/ {f(data.efectivo ?? data.monto)}</div>

          {data.impuestoRetenido! > 0 && (
            <>
              <br />
              <div>IMPUESTO RETENIDO: S/ {f(data.impuestoRetenido!)}</div>
            </>
          )}

          <br />
          <div className="tc">GRACIAS POR SU PREFERENCIA</div>
        </div>

        {/* botones */}
        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-base hover:bg-blue-700"
            onClick={handleImprimirNormal}
          >
            🖨️ Imprimir
          </button>
          <button
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg text-base hover:bg-gray-600"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* ayuda */}
      <InstruccionesImpresora isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}
