import { describe, expect, it } from 'vitest'
import { ControlHuevos } from '../ControlHuevos.js'
import { determinarResultado, RESULTADO } from '../Lanzamiento.js'
import { Partida } from '../Partida.js'
import { RegistroInferencias } from '../RegistroInferencias.js'
import { ejecutarEstrategia } from './Ejecutor.js'
import {
  generarSecuenciaOptima,
  SALTO_INICIAL,
  SECUENCIA_SALTOS_OPTIMA,
  siguientePisoOptima,
} from './EstrategiaOptima.js'

const estado = (maxSeguro, minRotura, huevosDisponibles, totalPisos) => ({
  maxSeguro,
  minRotura,
  huevosDisponibles,
  totalPisos,
})

// Aplica la estrategia pidiendo pisos hasta que devuelve null; solo sirve para probar la lógica pura.
function recorrer(pisoCritico) {
  const huevos = new ControlHuevos()
  const inferencias = new RegistroInferencias()
  const pisos = []
  for (;;) {
    const piso = siguientePisoOptima({
      maxSeguro: inferencias.maxSeguro,
      minRotura: inferencias.minRotura,
      huevosDisponibles: huevos.disponibles,
    })
    if (piso === null) {
      return { pisos, inferencias, huevos }
    }
    expect(inferencias.esRedundante(piso)).toBe(false)
    const resultado = determinarResultado(piso, pisoCritico)
    if (resultado === RESULTADO.SE_ROMPE) {
      huevos.romper()
    }
    inferencias.registrar(piso, resultado)
    pisos.push(piso)
  }
}

describe('siguientePisoOptima (RF-11, Prototipo V3)', () => {
  describe('secuencia de saltos decrecientes', () => {
    it('el salto inicial es de 14 pisos', () => {
      expect(SALTO_INICIAL).toBe(14)
    })

    it('la serie de pisos definida es: 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99 y 100', () => {
      expect(SECUENCIA_SALTOS_OPTIMA).toEqual([14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100])
    })

    it('las diferencias de saltos disminuyen en 1 hasta el 99', () => {
      const saltosEsperados = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4]
      for (let i = 0; i < saltosEsperados.length; i += 1) {
        const anterior = i === 0 ? 0 : SECUENCIA_SALTOS_OPTIMA[i - 1]
        const actual = SECUENCIA_SALTOS_OPTIMA[i]
        expect(actual - anterior).toBe(saltosEsperados[i])
      }
    })

    it('generarSecuenciaOptima reproduce exactamente la secuencia de 100 pisos', () => {
      expect(generarSecuenciaOptima(100, 14)).toEqual(SECUENCIA_SALTOS_OPTIMA)
    })
  })

  describe('con dos huevos salta con la secuencia decreciente', () => {
    it('sin lanzamientos previos empieza en el piso 14', () => {
      expect(siguientePisoOptima(estado(0, null, 2))).toBe(14)
    })

    it('avanza por la serie exacta mientras el huevo sobrevive', () => {
      expect(siguientePisoOptima(estado(14, null, 2))).toBe(27)
      expect(siguientePisoOptima(estado(27, null, 2))).toBe(39)
      expect(siguientePisoOptima(estado(39, null, 2))).toBe(50)
      expect(siguientePisoOptima(estado(50, null, 2))).toBe(60)
      expect(siguientePisoOptima(estado(60, null, 2))).toBe(69)
      expect(siguientePisoOptima(estado(69, null, 2))).toBe(77)
      expect(siguientePisoOptima(estado(77, null, 2))).toBe(84)
      expect(siguientePisoOptima(estado(84, null, 2))).toBe(90)
      expect(siguientePisoOptima(estado(90, null, 2))).toBe(95)
      expect(siguientePisoOptima(estado(95, null, 2))).toBe(99)
      expect(siguientePisoOptima(estado(99, null, 2))).toBe(100)
    })

    it('devuelve null si ya se alcanzó o superó el piso 100', () => {
      expect(siguientePisoOptima(estado(100, null, 2))).toBeNull()
    })
  })

  describe('con un solo huevo busca secuencialmente desde maxSeguro + 1', () => {
    it('simula rotura en piso 27 y verifica que los siguientes pisos sean 15, 16, 17…', () => {
      // El primer salto fue 14 (seguro) y el segundo fue 27 (se rompe)
      expect(siguientePisoOptima(estado(14, 27, 1))).toBe(15)
      expect(siguientePisoOptima(estado(15, 27, 1))).toBe(16)
      expect(siguientePisoOptima(estado(16, 27, 1))).toBe(17)
      expect(siguientePisoOptima(estado(25, 27, 1))).toBe(26)
    })

    it('si el primer huevo se rompe en el piso 14, empieza en el piso 1', () => {
      expect(siguientePisoOptima(estado(0, 14, 1))).toBe(1)
      expect(siguientePisoOptima(estado(1, 14, 1))).toBe(2)
      expect(siguientePisoOptima(estado(12, 14, 1))).toBe(13)
    })

    it('si se rompe en el piso 99 tras ser seguro el 95, busca en 96, 97 y 98', () => {
      expect(siguientePisoOptima(estado(95, 99, 1))).toBe(96)
      expect(siguientePisoOptima(estado(96, 99, 1))).toBe(97)
      expect(siguientePisoOptima(estado(97, 99, 1))).toBe(98)
    })

    it('con rotura confirmada no reintenta la fase de saltos aunque se indiquen 2 huevos', () => {
      expect(siguientePisoOptima(estado(14, 27, 2))).toBe(15)
    })
  })

  describe('cuando no hay nada que lanzar devuelve null', () => {
    it('sin huevos disponibles', () => {
      expect(siguientePisoOptima(estado(14, 27, 0))).toBeNull()
      expect(siguientePisoOptima(estado(0, null, 0))).toBeNull()
    })

    it('cuando F ya está determinado por certeza matemática', () => {
      expect(siguientePisoOptima(estado(26, 27, 1))).toBeNull()
      expect(siguientePisoOptima(estado(0, 1, 1))).toBeNull()
      expect(siguientePisoOptima(estado(98, 99, 1))).toBeNull()
      expect(siguientePisoOptima(estado(99, 100, 1))).toBeNull()
    })
  })

  describe('garantía matemática de encontrar F en máximo 14 lanzamientos (RF-11)', () => {
    it('con F = 27 necesita como máximo 14 intentos (2 saltos + 12 secuenciales)', () => {
      const { pisos, inferencias, huevos } = recorrer(27)
      expect(pisos).toEqual([14, 27, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26])
      expect(pisos).toHaveLength(14)
      expect(inferencias.pisoDeterminado).toBe(27)
      expect(huevos.rotos).toBe(1)
    })

    it('con F = 14 necesita 14 intentos (1 salto + 13 secuenciales)', () => {
      const { pisos, inferencias, huevos } = recorrer(14)
      expect(pisos).toEqual([14, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
      expect(pisos).toHaveLength(14)
      expect(inferencias.pisoDeterminado).toBe(14)
      expect(huevos.rotos).toBe(1)
    })

    it('con F = 1 se rompe en el 14 y prueba el piso 1 (2 intentos)', () => {
      const { pisos, inferencias, huevos } = recorrer(1)
      expect(pisos).toEqual([14, 1])
      expect(pisos).toHaveLength(2)
      expect(inferencias.pisoDeterminado).toBe(1)
      expect(huevos.rotos).toBe(2)
    })

    it('con F = 99 necesita como máximo 14 intentos', () => {
      const { pisos, inferencias } = recorrer(99)
      expect(pisos).toEqual([14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 96, 97, 98])
      expect(pisos.length).toBeLessThanOrEqual(14)
      expect(inferencias.pisoDeterminado).toBe(99)
    })

    it('para cada F de 1 a 100 encuentra F en un máximo de 14 intentos', () => {
      for (let pisoCritico = 1; pisoCritico <= 100; pisoCritico += 1) {
        const { pisos, inferencias, huevos } = recorrer(pisoCritico)
        expect(inferencias.pisoDeterminado).toBe(pisoCritico)
        expect(huevos.rotos).toBeLessThanOrEqual(2)
        expect(pisos.length).toBeLessThanOrEqual(14)
        expect(new Set(pisos).size).toBe(pisos.length)
      }
    })
  })

  describe('ejecución con el motor Ejecutor (RF-08 y RF-11)', () => {
    it('resuelve la partida en Ejecutor para F = 27 con resuelta = true', () => {
      const partida = new Partida()
      partida.iniciar({ pisoCritico: 27 })
      const resultado = ejecutarEstrategia(partida, siguientePisoOptima)

      expect(resultado.resuelta).toBe(true)
      expect(resultado.pisoIdentificado).toBe(27)
      expect(resultado.intentos).toBe(14)
      expect(resultado.huevosRotos).toBe(1)
    })

    it('en Ejecutor ningún escenario de 1 a 100 supera 14 intentos', () => {
      let maxIntentos = 0
      for (let f = 1; f <= 100; f += 1) {
        const partida = new Partida()
        partida.iniciar({ pisoCritico: f })
        const resultado = ejecutarEstrategia(partida, siguientePisoOptima)
        expect(resultado.resuelta).toBe(true)
        expect(resultado.pisoIdentificado).toBe(f)
        expect(resultado.intentos).toBeLessThanOrEqual(14)
        if (resultado.intentos > maxIntentos) {
          maxIntentos = resultado.intentos
        }
      }
      expect(maxIntentos).toBe(14)
    })
  })
})
