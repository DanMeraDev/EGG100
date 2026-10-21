import { describe, expect, it } from 'vitest'
import { Historial } from './Historial.js'
import { RESULTADO } from './Lanzamiento.js'

describe('Historial', () => {
  it('numera los intentos de forma consecutiva desde 1', () => {
    const historial = new Historial()
    historial.registrar(50, RESULTADO.SE_ROMPE)
    historial.registrar(10, RESULTADO.SOBREVIVE)
    expect(historial.total).toBe(2)
    expect(historial.lanzamientos.map(({ numero, piso, seRompio }) => [numero, piso, seRompio])).toEqual([
      [1, 50, true],
      [2, 10, false],
    ])
  })

  it('no se puede alterar desde fuera', () => {
    const historial = new Historial()
    const lanzamiento = historial.registrar(5, RESULTADO.SOBREVIVE)
    historial.lanzamientos.push('intruso')
    expect(historial.total).toBe(1)
    expect(Object.isFrozen(lanzamiento)).toBe(true)
  })
})
