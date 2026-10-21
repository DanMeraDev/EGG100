import { describe, expect, it } from 'vitest'
import { Edificio } from './Edificio.js'

describe('Edificio (RF-01, RF-02)', () => {
  const edificio = new Edificio()

  it('tiene 100 pisos numerados del 1 al 100 (CP-01)', () => {
    expect(edificio.totalPisos).toBe(100)
    expect(edificio.pisos).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
  })

  it('acepta cualquier piso entre 1 y 100 (CP-02)', () => {
    for (const piso of edificio.pisos) {
      expect(edificio.interpretarPiso(piso)).toBe(piso)
    }
  })

  it.each([0, 101, -1, 2.5, Number.NaN, '', ' ', 'abc', '10a', '1e2', '-3', null, undefined])(
    'rechaza %o (CP-02)',
    (valor) => {
      expect(edificio.interpretarPiso(valor)).toBeNull()
    },
  )

  it('interpreta el texto que escribe el usuario', () => {
    expect(edificio.interpretarPiso('40')).toBe(40)
    expect(edificio.interpretarPiso(' 7 ')).toBe(7)
  })

  it('no admite edificios sin pisos', () => {
    expect(() => new Edificio(0)).toThrow(RangeError)
  })
})
