import jsPDF from 'jspdf'
import { ReciboData } from '../types/recibo'

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export const generatePDF = async (data: ReciboData) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 120] // Tamaño exacto del recibo
  })

  // Configurar fuente monospace para simular impresora térmica
  pdf.setFont('courier')
  
  let yPosition = 8

  // Logo GRANDE sin cuadrado
  try {
    const logoImg = await loadImage('/interbank.png')
    pdf.addImage(logoImg, 'PNG', 5, yPosition, 40, 8) // Logo MUCHO más grande, centrado
  } catch (error) {
    // Si no se puede cargar el logo, usar texto
    pdf.setFontSize(12)
    pdf.text('Interbank', 5, yPosition + 3)
  }
  yPosition += 12
  
  // Información del header exacta como en la imagen
  pdf.setFontSize(6)
  pdf.text('------------------------------------', 5, yPosition)
  yPosition += 4
  
  pdf.text(`${data.sucursal} TLF 216-045998 ${data.fecha.replace(/-/g, '/')} ${data.hora}`, 5, yPosition)
  yPosition += 3
  pdf.text(`NRO. OPE 000236`, 5, yPosition)
  
  yPosition += 4
  // Número de cuenta con asteriscos EXACTO como en la imagen
  const cuentaOculta = 'TARJ: NRO****************' + data.numeroCuenta.slice(-2)
  pdf.text(cuentaOculta, 5, yPosition)
  yPosition += 3
  pdf.text(`T.DOC: DNI`, 5, yPosition)
  
  yPosition += 6
  pdf.text('PRODUCTO: CUENTA CORRIENTE S/N', 5, yPosition)
  yPosition += 3
  pdf.text(`CUENTA: ${data.numeroCuenta}`, 5, yPosition)
  yPosition += 3
  pdf.text(`RUC: ${data.numeroDocumento}`, 5, yPosition)
  
  yPosition += 6
  pdf.setFont('courier', 'bold')
  pdf.text('EFECTIVO', 5, yPosition)
  
  yPosition += 6
  pdf.setFont('courier', 'normal')
  // Formato exacto como en la imagen con espaciado y comas
  const montoStr = data.monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  pdf.text(`IMPORTE DEPOSITADO          ${montoStr}`, 5, yPosition)
  yPosition += 3
  pdf.text(`MONEDA DEPOSITO    ${data.moneda}`, 5, yPosition)
  
  yPosition += 6
  pdf.text('------------------------------------', 5, yPosition)
  
  yPosition += 4
  pdf.text('FORMA DE PAGO', 5, yPosition)
  yPosition += 3
  const efectivoStr = data.efectivo.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const recibidoStr = data.monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  pdf.text(`EFECTIVO: ${efectivoStr} / RECIBIDO: ${recibidoStr}`, 5, yPosition)
  
  yPosition += 6
  if (data.impuestoRetenido > 0) {
    const impuestoStr = data.impuestoRetenido.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    pdf.text(`IMPUESTO RETENIDO: ${impuestoStr}`, 5, yPosition)
    yPosition += 3
    pdf.text('C.DETRACCION - VALIDADO SUNAT/PAGO', 5, yPosition)
    yPosition += 6
  }

  pdf.text('------------------------------------', 5, yPosition)

  // Generar nombre del archivo
  const fileName = `recibo_interbank_${data.numeroOperacion.replace('-', '_')}_${new Date().getTime()}.pdf`
  
  // Descargar PDF
  pdf.save(fileName)
}