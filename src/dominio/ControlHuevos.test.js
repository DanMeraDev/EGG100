import { describe, expect, it } from 'vitest'
import { ControlHuevos } from './ControlHuevos.js'

describe('ControlHuevos (RF-04, RN-03)', () => {
  it('empieza con dos huevos disponibles', () => {
    const huevos = new ControlHuevos()
    expect(huevos.iniciales).toBe(2)
    expect(huevos.disponibles).toBe(2)
    expect(huevos.hayDisponibles).toBe(true)
  })

  it('cada rotura descuenta exactamente un huevo (CP-04)', () => {
    const huevos = new ControlHuevos()
    huevos.romper()
    expect([huevos.disponibles, huevos.rotos]).toEqual([1, 1])
    huevos.romper()
    expect([huevos.disponibles, huevos.rotos]).toEqual([0, 2])
    expect(huevos.hayDisponibles).toBe(false)
  })

  it('no permite romper más huevos de los disponibles', () => {
    const huevos = new ControlHuevos()
    huevos.romper()
    huevos.romper()
    expect(() => huevos.romper()).toThrow('No quedan huevos disponibles')
    expect(huevos.disponibles).toBe(0)
  })
})
