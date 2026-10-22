import { describe, expect, it } from 'vitest'
import { compararEstrategias } from './Comparador.js'
import { ID_ESTRATEGIA } from './RegistroEstrategias.js'
import { siguientePisoSaltosFijos } from './SaltosFijos.js'
import { siguientePisoSecuencial } from './Secuencial.js'

describe('Comparador de estrategias (RF-10, CU-06)', () => {
  it('con F = 40 ordena de menor a mayor intentos (gana Saltos de 10)', () => {
    const resultados = compararEstrategias(40, ['secuencial', 'saltos_10'])

    expect(resultados).toHaveLength(2)
    expect(resultados[0].id).toBe('saltos_10')
    expect(resultados[0].intentos).toBe(13)
    expect(resultados[0].resuelta).toBe(true)
    expect(resultados[0].pisoIdentificado).toBe(40)

    expect(resultados[1].id).toBe('secuencial')
    expect(resultados[1].intentos).toBe(40)
    expect(resultados[1].resuelta).toBe(true)
    expect(resultados[1].pisoIdentificado).toBe(40)

    // Saltos de 10 necesitó menos intentos que Secuencial
    expect(resultados[0].intentos).toBeLessThan(resultados[1].intentos)
  })

  it('soporta alias comunes como saltos_fijos_10', () => {
    const resultados = compararEstrategias(40, ['secuencial', 'saltos_fijos_10'])

    expect(resultados[0].id).toBe('saltos_fijos_10')
    expect(resultados[0].intentos).toBe(13)
    expect(resultados[1].id).toBe('secuencial')
    expect(resultados[1].intentos).toBe(40)
  })

  it('admite pasar las funciones de estrategia directamente', () => {
    const resultados = compararEstrategias(40, [siguientePisoSecuencial, siguientePisoSaltosFijos])

    expect(resultados[0].id).toBe(ID_ESTRATEGIA.SALTOS_10)
    expect(resultados[0].intentos).toBe(13)
    expect(resultados[1].id).toBe(ID_ESTRATEGIA.SECUENCIAL)
    expect(resultados[1].intentos).toBe(40)
  })

  it('con F = 1 Secuencial es más eficiente que Saltos de 10', () => {
    const resultados = compararEstrategias(1, ['secuencial', 'saltos_10'])

    expect(resultados[0].id).toBe('secuencial')
    expect(resultados[0].intentos).toBe(1)
    expect(resultados[1].id).toBe('saltos_10')
    expect(resultados[1].intentos).toBe(2)
  })

  it('con F = 100 Saltos de 10 es más eficiente que Secuencial', () => {
    const resultados = compararEstrategias(100, ['secuencial', 'saltos_10'])

    expect(resultados[0].id).toBe('saltos_10')
    expect(resultados[0].intentos).toBe(19)
    expect(resultados[1].id).toBe('secuencial')
    expect(resultados[1].intentos).toBe(99)
  })

  it('si no se especifican estrategias, compara las disponibles por defecto', () => {
    const resultados = compararEstrategias(40)

    expect(resultados.length).toBeGreaterThanOrEqual(2)
    const ids = resultados.map(({ id }) => id)
    expect(ids).toContain(ID_ESTRATEGIA.SALTOS_10)
    expect(ids).toContain(ID_ESTRATEGIA.SECUENCIAL)
    // Verifica que esté ordenado ascendentemente
    for (let i = 1; i < resultados.length; i += 1) {
      expect(resultados[i].intentos).toBeGreaterThanOrEqual(resultados[i - 1].intentos)
    }
  })

  it('cada estrategia se evalúa en una partida independiente sin contaminar el estado', () => {
    const resultados = compararEstrategias(35, ['saltos_10', 'secuencial'])

    // Con F = 35, Saltos de 10 rompe 2 huevos y resuelve en 9 intentos
    expect(resultados[0].id).toBe('saltos_10')
    expect(resultados[0].intentos).toBe(9)
    expect(resultados[0].huevosRotos).toBe(2)
    expect(resultados[0].resuelta).toBe(true)

    // Secuencial corre en su propia partida independiente con sus 2 huevos iniciales
    expect(resultados[1].id).toBe('secuencial')
    expect(resultados[1].intentos).toBe(35)
    expect(resultados[1].huevosRotos).toBe(1)
    expect(resultados[1].resuelta).toBe(true)
  })

  it('lanza RangeError si el piso crítico es inválido', () => {
    for (const f of [0, 101, -1, 2.5, 'abc', null]) {
      expect(() => compararEstrategias(f)).toThrow(RangeError)
    }
  })

  it('lanza error si se pasa un identificador de estrategia desconocido', () => {
    expect(() => compararEstrategias(40, ['desconocida'])).toThrow(/Estrategia desconocida/)
  })

  it('retorna arreglo vacío si la lista de estrategias a comparar está vacía', () => {
    expect(compararEstrategias(40, [])).toEqual([])
  })
})
