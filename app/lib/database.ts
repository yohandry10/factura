// Simulación de base de datos local con localStorage
export interface OperacionGuardada extends ReciboData {
  id: number
  numeroOperacion: string
  fechaCreacion: Date
}

import { ReciboData } from '../types/recibo'

export class DatabaseManager {
  private static STORAGE_KEY = 'interbank_operaciones'
  private static COUNTER_KEY = 'interbank_contador'

  // Obtener próximo número de operación
  static getNextOperationNumber(): string {
    if (typeof window === 'undefined') return '216-000001'
    
    const counter = localStorage.getItem(this.COUNTER_KEY)
    const nextNumber = counter ? parseInt(counter) + 1 : 1
    localStorage.setItem(this.COUNTER_KEY, nextNumber.toString())
    
    return `216-${nextNumber.toString().padStart(6, '0')}`
  }

  // Guardar operación
  static saveOperation(data: ReciboData): OperacionGuardada {
    if (typeof window === 'undefined') {
      throw new Error('No se puede guardar en el servidor')
    }

    const operacion: OperacionGuardada = {
      ...data,
      id: Date.now(),
      numeroOperacion: this.getNextOperationNumber(),
      fechaCreacion: new Date()
    }

    const operaciones = this.getAllOperations()
    operaciones.push(operacion)
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(operaciones))
    return operacion
  }

  // Obtener todas las operaciones
  static getAllOperations(): OperacionGuardada[] {
    if (typeof window === 'undefined') return []
    
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  // Obtener operación por ID
  static getOperationById(id: number): OperacionGuardada | null {
    const operaciones = this.getAllOperations()
    return operaciones.find(op => op.id === id) || null
  }

  // Obtener estadísticas
  static getStats() {
    const operaciones = this.getAllOperations()
    const totalOperaciones = operaciones.length
    const montoTotal = operaciones.reduce((sum, op) => sum + op.monto, 0)
    
    return {
      totalOperaciones,
      montoTotal,
      ultimaOperacion: operaciones[operaciones.length - 1]
    }
  }
}