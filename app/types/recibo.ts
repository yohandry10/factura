// src/types/recibo.ts
export interface ReciboData {
  /* Metadatos */
  fecha: string
  hora: string
  numeroOperacion?: string  // Se genera al guardar

  /* Información del cliente */
  numeroCuenta: string
  nombreCliente: string
  tipoDocumento: string
  numeroDocumento: string

  /* Detalles de la operación */
  tipoOperacion: string
  moneda: string
  monto: number

  /* Información adicional */
  formaPago: string
  efectivo?: number
  montoDeposito: number
  impuestoRetenido?: number

  /* Saldos */
  saldoDisponible?: number

  /* Observaciones */
  observaciones?: string
  sucursal: string
}
