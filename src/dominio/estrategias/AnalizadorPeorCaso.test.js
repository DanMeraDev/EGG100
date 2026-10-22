import { describe, expect, it } from 'vitest'
import {
  analizarPeorCaso,
  analizarTodasLasEstrategias,
} from './AnalizadorPeorCaso.js'
import { siguientePisoOptima } from './EstrategiaOptima.js'
import { ID_ESTRATEGIA } from './RegistroEstrategias.js'
import { siguientePisoSaltosFijos } from './SaltosFijos.js'
import { siguientePisoSecuencial } from './Secuencial.js'

describe('AnalizadorPeorCaso (RF-13, Prototipo V3)', () => {
  describe('analizarPeorCaso individual', () => {
    it('el peor caso de la estrategia Secuencial devuelve 99 intentos', () => {
      const resultado = analizarPeorCaso('secuencial')

      expect(resultado.estrategiaId).toBe('secuencial')
      // En el dominio de EGG100, al sobrevivir en 99 se deduce F = 100, requiriendo 99 lanzamientos
      expect(resultado.maxIntentos).toBe(99)
      expect(resultado.peorCaso).toBe(99)
      expect(resultado.casos).toHaveLength(100)
      expect(resultado.casos.every((c) => c.resuelta)).toBe(true)
      expect(resultado.pisosPeorCaso).toContain(99)
      expect(resultado.pisosPeorCaso).toContain(100)
    })

    it('el peor caso de Saltos de 10 devuelve exactamente 19 intentos', () => {
      const resultado = analizarPeorCaso('saltos_10')

      expect(resultado.estrategiaId).toBe('saltos_10')
      expect(resultado.maxIntentos).toBe(19)
      expect(resultado.peorCaso).toBe(19)
      // Ocurre en pisos críticos como el 99 (salta hasta 100 rompiendo 1 huevo, y prueba 91 a 99)
      expect(resultado.pisosPeorCaso).toContain(99)
    })

    it('Prueba de Fuego: el peor caso de la estrategia Óptima es exactamente 14', () => {
      const resultado = analizarPeorCaso('optima')

      expect(resultado.estrategiaId).toBe('optima')
      expect(resultado.maxIntentos).toBe(14)
      expect(resultado.peorCaso).toBe(14)
      expect(resultado.casos).toHaveLength(100)
      expect(resultado.casos.every((c) => c.resuelta)).toBe(true)
      expect(resultado.casos.every((c) => c.intentos <= 14)).toBe(true)
      expect(resultado.casos.every((c) => c.huevosRotos <= 2)).toBe(true)

      // El peor caso de 14 intentos ocurre en los límites de cada bloque de saltos
      expect(resultado.pisosPeorCaso).toEqual([
        13, 14, 26, 27, 38, 39, 49, 50, 59, 60, 68, 69, 76, 77, 83, 84, 89, 90, 94, 95, 98, 99,
      ])
      for (const piso of [14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99]) {
        expect(resultado.pisosPeorCaso).toContain(piso)
      }
    })

    it('admite pasar la función de la estrategia directamente', () => {
      const resultadoSecuencial = analizarPeorCaso(siguientePisoSecuencial)
      expect(resultadoSecuencial.estrategiaId).toBe(ID_ESTRATEGIA.SECUENCIAL)
      expect(resultadoSecuencial.maxIntentos).toBe(99)

      const resultadoSaltos = analizarPeorCaso(siguientePisoSaltosFijos)
      expect(resultadoSaltos.estrategiaId).toBe(ID_ESTRATEGIA.SALTOS_10)
      expect(resultadoSaltos.maxIntentos).toBe(19)

      const resultadoOptima = analizarPeorCaso(siguientePisoOptima)
      expect(resultadoOptima.estrategiaId).toBe(ID_ESTRATEGIA.OPTIMA)
      expect(resultadoOptima.maxIntentos).toBe(14)
    })

    it('soporta alias comunes como saltos_fijos_10', () => {
      const resultado = analizarPeorCaso('saltos_fijos_10')
      expect(resultado.maxIntentos).toBe(19)
    })

    it('admite un total de pisos personalizado', () => {
      const resultado = analizarPeorCaso('secuencial', 20)
      expect(resultado.casos).toHaveLength(20)
      expect(resultado.maxIntentos).toBe(19)
    })

    it('lanza RangeError si totalPisos no es un entero positivo', () => {
      for (const invalido of [0, -10, 1.5, '100', null]) {
        expect(() => analizarPeorCaso('optima', invalido)).toThrow(RangeError)
      }
    })

    it('lanza error si la estrategia no es válida o desconocida', () => {
      expect(() => analizarPeorCaso('inexistente')).toThrow(/Estrategia desconocida/)
      expect(() => analizarPeorCaso(123)).toThrow(TypeError)
    })
  })

  describe('analizarTodasLasEstrategias', () => {
    it('compara todas las estrategias y confirma a Óptima como la ganadora con menor peor caso (RF-14)', () => {
      const analisis = analizarTodasLasEstrategias()

      expect(analisis.peorCaso).toEqual({
        secuencial: 99,
        saltos_10: 19,
        optima: 14,
      })

      expect(analisis.menorPeorCaso).toEqual(['optima'])
      expect(analisis.optimaValida).toBe(true)
      expect(analisis.resultados).toHaveLength(3)
    })

    it('valida que el menor peor caso de Óptima sea estrictamente menor que Saltos y Secuencial', () => {
      const { peorCaso } = analizarTodasLasEstrategias()

      expect(peorCaso.optima).toBeLessThan(peorCaso.saltos_10)
      expect(peorCaso.saltos_10).toBeLessThan(peorCaso.secuencial)
    })

    it('permite filtrar qué estrategias analizar', () => {
      const analisis = analizarTodasLasEstrategias(100, ['saltos_10', 'optima'])

      expect(analisis.peorCaso).toEqual({
        saltos_10: 19,
        optima: 14,
      })
      expect(analisis.menorPeorCaso).toEqual(['optima'])
      expect(analisis.resultados).toHaveLength(2)
    })
  })
})
