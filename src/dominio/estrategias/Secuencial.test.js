import { describe, expect, it } from 'vitest'
import { ControlHuevos } from '../ControlHuevos.js'
import { determinarResultado, RESULTADO } from '../Lanzamiento.js'
import { RegistroInferencias } from '../RegistroInferencias.js'
import { siguientePisoSecuencial } from './Secuencial.js'

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
    const piso = siguientePisoSecuencial({
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

describe('siguientePisoSecuencial (RF-07, RF-08)', () => {
  it('sin lanzamientos previos empieza en el piso 1', () => {
    expect(siguientePisoSecuencial(estado(0, null, 2))).toBe(1)
  })

  it('siempre es el último piso seguro + 1', () => {
    expect(siguientePisoSecuencial(estado(1, null, 2))).toBe(2)
    expect(siguientePisoSecuencial(estado(37, null, 2))).toBe(38)
    expect(siguientePisoSecuencial(estado(98, null, 2))).toBe(99)
  })

  it('no depende de cuántos huevos queden mientras haya alguno', () => {
    expect(siguientePisoSecuencial(estado(20, null, 2))).toBe(21)
    expect(siguientePisoSecuencial(estado(20, 40, 1))).toBe(21)
  })

  it('con una rotura confirmada sigue en el último piso seguro + 1 si aún hay pisos desconocidos', () => {
    expect(siguientePisoSecuencial(estado(30, 40, 1))).toBe(31)
    expect(siguientePisoSecuencial(estado(38, 40, 1))).toBe(39)
  })

  it('devuelve null cuando la evidencia ya determina F', () => {
    expect(siguientePisoSecuencial(estado(39, 40, 1))).toBeNull()
    expect(siguientePisoSecuencial(estado(0, 1, 1))).toBeNull()
  })

  it('devuelve null tras sobrevivir en el piso 99, porque F = 100 ya está demostrado', () => {
    expect(siguientePisoSecuencial(estado(99, null, 2))).toBeNull()
  })

  it('devuelve null si no quedan huevos', () => {
    expect(siguientePisoSecuencial(estado(10, null, 0))).toBeNull()
    expect(siguientePisoSecuencial(estado(10, 50, 0))).toBeNull()
  })

  it('respeta un edificio con otro número de pisos', () => {
    expect(siguientePisoSecuencial(estado(0, null, 2, 5))).toBe(1)
    expect(siguientePisoSecuencial(estado(3, null, 2, 5))).toBe(4)
    expect(siguientePisoSecuencial(estado(4, null, 2, 5))).toBeNull()
  })

  it('para cada F de 1 a 100 recorre 1, 2, 3… sin repetir y la evidencia termina determinando F (CP-08)', () => {
    for (let pisoCritico = 1; pisoCritico <= 100; pisoCritico += 1) {
      const { pisos, inferencias, huevos } = recorrer(pisoCritico)
      const esperados = Array.from({ length: Math.min(pisoCritico, 99) }, (_, indice) => indice + 1)
      expect(pisos).toEqual(esperados)
      expect(inferencias.pisoDeterminado).toBe(pisoCritico)
      expect(huevos.rotos).toBeLessThanOrEqual(1)
    }
  })
})
