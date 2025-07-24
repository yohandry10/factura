'use client'

/**
 * ESC/POS helper — EPSON TM‑T20II
 * Margen izquierdo 32 dots (≈ 4 mm) via GS L
 */
export class ThermalPrinter {
  private port: SerialPort | null = null
  private writer: WritableStreamDefaultWriter | null = null

  async connect() {
    try {
      this.port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x04b8 }] })
      await this.port.open({ baudRate: 9600, dataBits: 8, stopBits: 1 })
      this.writer = this.port.writable!.getWriter()
      return true
    } catch {
      return false
    }
  }

  private async write(data: Uint8Array | string) {
    if (!this.writer) throw new Error('Sin conexión')
    const d = typeof data === 'string' ? new TextEncoder().encode(data) : data
    await this.writer.write(d)
  }

  async printRecibo(r: import('@/types/recibo').ReciboData) {
    try {
      const n = (x: number) => x.toFixed(2)

      /* Reset y margen izquierdo 32 dots (0x20) */
      await this.write('\x1B@\n')
      await this.write(new Uint8Array([0x1D, 0x4C, 0x20, 0x00]))  // GS L nL nH

      /* Logo centrado 2× */
      await this.write('\x1B\x61\x01')
      await this.write('\x1D!\x11Interbank\n')
      await this.write('\x1D!\x00')
      await this.write('\x1B\x61\x00')

      await this.write('--------------------------------\n')
      await this.write(`${r.sucursal}\n`)
      await this.write(`${r.fecha.replace(/-/g, '/')} ${r.hora}\n`)
      await this.write(`NRO. OPE ${r.numeroOperacion}\n\n`)

      await this.write(`CUENTA: ${r.numeroCuenta}\n`)
      await this.write(`DOC: ${r.numeroDocumento}\n\n`)
      await this.write(`${r.tipoOperacion}\n`)
      await this.write(`IMPORTE: S/ ${n(r.monto)}\n\n`)
      await this.write('--------------------------------\n')
      await this.write(`FORMA DE PAGO ${r.formaPago}\n`)
      await this.write(`Efectivo: S/ ${n(r.efectivo ?? r.monto)}\n`)
      if (r.impuestoRetenido! > 0) {
        await this.write(`IMPUESTO RETENIDO: S/ ${n(r.impuestoRetenido!)}\n`)
      }

      await this.write('\nGRACIAS POR SU PREFERENCIA\n')
      await this.write('\x1B d\x02')
      await this.write(new Uint8Array([0x1D, 0x56, 0x01]))
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async testPrint() {
    try {
      await this.write('\x1B@\x1D!\x11TEST 2×\n\x1D!\x00Hola mundo\n')
      await this.write('\x1B d\x02')
      await this.write(new Uint8Array([0x1D, 0x56, 0x01]))
      return true
    } catch { return false }
  }

  async disconnect() {
    await this.writer?.close()
    await this.port?.close()
  }
}
