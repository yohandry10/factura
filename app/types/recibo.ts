export interface ReciboData {
  // Información del banco
  sucursal: string
  fecha: string
  hora: string
  numeroOperacion?: string // Opcional porque se genera automáticamente
  
  // Información del cliente
  numeroCuenta: string
  nombreCliente: string
  tipoDocumento: string
  numeroDocumento: string
  
  // Detalles de la operación
  tipoOperacion: string
  moneda: string
  monto: number
  
  // Información adicional
  formaPago: string
  efectivo: number
  montoDeposito: number
  impuestoRetenido: number
  
  // Saldo disponible
  saldoDisponible: number
  
  // Observaciones
  observaciones?: string
}