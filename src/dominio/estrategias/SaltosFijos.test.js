import { describe, expect, it } from 'vitest'
import { ControlHuevos } from '../ControlHuevos.js'
import { determinarResultado, RESULTADO } from '../Lanzamiento.js'
import { RegistroInferencias } from '../RegistroInferencias.js'
import { SALTO, siguientePisoSaltosFijos } from './SaltosFijos.js'

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
    const piso = siguientePisoSaltosFijos({
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

describe('siguientePisoSaltosFijos (RF-21)', () => {
  it('el salto por defecto es de 10 pisos', () => {
    expect(SALTO).toBe(10)
  })

  describe('con dos huevos salta de 10 en 10 desde el último piso seguro', () => {
    it('sin lanzamientos previos lanza en el piso 10', () => {
      expect(siguientePisoSaltosFijos(estado(0, null, 2))).toBe(10)
    })

    it('avanza 10, 20, 30… a medida que sobrevive', () => {
      expect(siguientePisoSaltosFijos(estado(10, null, 2))).toBe(20)
      expect(siguientePisoSaltosFijos(estado(20, null, 2))).toBe(30)
      expect(siguientePisoSaltosFijos(estado(80, null, 2))).toBe(90)
      expect(siguientePisoSaltosFijos(estado(90, null, 2))).toBe(100)
    })

    it('no pasa del último piso del edificio', () => {
      expect(siguientePisoSaltosFijos(estado(95, null, 2))).toBe(100)
      expect(siguientePisoSaltosFijos(estado(0, null, 2, 5))).toBe(5)
    })

    it('admite otro tamaño de salto', () => {
      expect(siguientePisoSaltosFijos(estado(0, null, 2), 5)).toBe(5)
      expect(siguientePisoSaltosFijos(estado(5, null, 2), 5)).toBe(10)
    })
  })

  describe('con un solo huevo busca de forma secuencial desde el último piso seguro + 1', () => {
    it('tras romperse en 40 sin pisos seguros por encima de 30, sigue en 31, 32…', () => {
      expect(siguientePisoSaltosFijos(estado(30, 40, 1))).toBe(31)
      expect(siguientePisoSaltosFijos(estado(31, 40, 1))).toBe(32)
      expect(siguientePisoSaltosFijos(estado(38, 40, 1))).toBe(39)
    })

    it('si el primer huevo se rompe en el primer salto, empieza en el piso 1', () => {
      expect(siguientePisoSaltosFijos(estado(0, 10, 1))).toBe(1)
    })

    it('un solo huevo sin roturas (estado ajeno a esta estrategia) también avanza de uno en uno', () => {
      expect(siguientePisoSaltosFijos(estado(20, null, 1))).toBe(21)
    })

    it('con dos huevos pero una rotura ya conocida no repite pisos: sigue en secuencial', () => {
      expect(siguientePisoSaltosFijos(estado(30, 40, 2))).toBe(31)
    })
  })

  describe('cuando no hay nada que lanzar devuelve null', () => {
    it('sin huevos', () => {
      expect(siguientePisoSaltosFijos(estado(30, 40, 0))).toBeNull()
      expect(siguientePisoSaltosFijos(estado(0, null, 0))).toBeNull()
    })

    it('cuando F ya está determinado', () => {
      expect(siguientePisoSaltosFijos(estado(39, 40, 1))).toBeNull()
      expect(siguientePisoSaltosFijos(estado(0, 1, 1))).toBeNull()
      expect(siguientePisoSaltosFijos(estado(99, null, 2))).toBeNull()
    })
  })

  describe('recorrido completo (solo para validar la lógica pura)', () => {
    it('con F = 40 lanza 10, 20, 30, 40 y luego 31, 32… 39 (CP-21)', () => {
      const { pisos, inferencias, huevos } = recorrer(40)
      expect(pisos).toEqual([10, 20, 30, 40, 31, 32, 33, 34, 35, 36, 37, 38, 39])
      expect(inferencias.pisoDeterminado).toBe(40)
      expect(huevos.rotos).toBe(1)
    })

    it('con F = 35 lanza 10, 20, 30, 40 y examina 31 a 35, rompiendo el segundo huevo', () => {
      const { pisos, inferencias, huevos } = recorrer(35)
      expect(pisos).toEqual([10, 20, 30, 40, 31, 32, 33, 34, 35])
      expect(inferencias.pisoDeterminado).toBe(35)
      expect(huevos.rotos).toBe(2)
    })

    it('con F = 100 salta hasta el 90, rompe en el 100 y examina 91 a 99', () => {
      const { pisos, inferencias } = recorrer(100)
      expect(pisos).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 91, 92, 93, 94, 95, 96, 97, 98, 99])
      expect(inferencias.pisoDeterminado).toBe(100)
    })

    it('con F = 1 se rompe en el primer salto y examina el piso 1', () => {
      const { pisos, inferencias } = recorrer(1)
      expect(pisos).toEqual([10, 1])
      expect(inferencias.pisoDeterminado).toBe(1)
    })

    it('para cada F de 1 a 100 identifica F con a lo sumo dos huevos y sin repetir pisos (CP-21)', () => {
      for (let pisoCritico = 1; pisoCritico <= 100; pisoCritico += 1) {
        const { pisos, inferencias, huevos } = recorrer(pisoCritico)
        expect(inferencias.pisoDeterminado).toBe(pisoCritico)
        expect(huevos.rotos).toBeLessThanOrEqual(2)
        expect(new Set(pisos).size).toBe(pisos.length)
      }
    })
  })
})
