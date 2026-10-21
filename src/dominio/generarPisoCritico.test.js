import { describe, expect, it } from 'vitest'
import { generarPisoCriticoAleatorio } from './generarPisoCritico.js'

describe('generarPisoCriticoAleatorio (RN-07)', () => {
  it('reparte el rango de Math.random entre los pisos 1 y 100', () => {
    expect(generarPisoCriticoAleatorio(100, () => 0)).toBe(1)
    expect(generarPisoCriticoAleatorio(100, () => 0.395)).toBe(40)
    expect(generarPisoCriticoAleatorio(100, () => 0.999999)).toBe(100)
  })

  it('siempre devuelve un piso entero dentro del edificio', () => {
    for (let i = 0; i < 1000; i += 1) {
      const piso = generarPisoCriticoAleatorio()
      expect(Number.isInteger(piso) && piso >= 1 && piso <= 100).toBe(true)
    }
  })
})
