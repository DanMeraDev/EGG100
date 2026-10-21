import { describe, expect, it, vi } from 'vitest'
import { RESULTADO } from './Lanzamiento.js'
import { ESTADO_PARTIDA, Partida, TIPO_DECLARACION, TIPO_LANZAMIENTO } from './Partida.js'
import { ESTADO_PISO } from './RegistroInferencias.js'

const { SEGURO, ROTURA, DESCONOCIDO } = ESTADO_PISO

// Inicia una partida cuyo generador devuelve, en orden, los pisos críticos indicados.
function partidaCon(...pisosCriticos) {
  const generar = vi.fn()
  pisosCriticos.forEach((piso) => generar.mockReturnValueOnce(piso))
  const partida = new Partida({ generarPisoCritico: generar })
  partida.iniciar()
  return { partida, generar }
}

function estadosDePisos(partida) {
  return partida.instantanea().pisos.map(({ estado }) => estado)
}

describe('Partida', () => {
  describe('inicio (RF-17, RN-07, CU-09)', () => {
    it('antes de iniciar no permite lanzar ni declarar', () => {
      const partida = new Partida({ generarPisoCritico: () => 40 })
      expect(partida.estado).toBe(ESTADO_PARTIDA.SIN_INICIAR)
      expect(partida.lanzar(10).tipo).toBe(TIPO_LANZAMIENTO.PARTIDA_INACTIVA)
      expect(partida.declarar(10).tipo).toBe(TIPO_DECLARACION.PARTIDA_INACTIVA)
    })

    it('genera F oculto y empieza con dos huevos, cero intentos y pisos desconocidos (CP-17)', () => {
      const { partida, generar } = partidaCon(40)
      expect(generar).toHaveBeenCalledWith(100)
      expect(partida.estado).toBe(ESTADO_PARTIDA.EN_CURSO)
      expect(partida.huevosDisponibles).toBe(2)
      expect(partida.intentos).toBe(0)
      expect(partida.historial).toEqual([])
      expect(new Set(estadosDePisos(partida))).toEqual(new Set([DESCONOCIDO]))
      expect(partida.pisoCriticoRevelado).toBeNull()
      expect(partida.instantanea().pisoCriticoRevelado).toBeNull()
    })

    it('rechaza un generador que devuelve un piso fuera del edificio', () => {
      const partida = new Partida({ generarPisoCritico: () => 101 })
      expect(() => partida.iniciar()).toThrow(RangeError)
    })
  })

  describe('lanzamiento manual (RF-02 a RF-05, CU-01)', () => {
    it('para cada F de 1 a 100, el huevo se rompe exactamente desde F (CP-03)', () => {
      for (let pisoCritico = 1; pisoCritico <= 100; pisoCritico += 1) {
        for (let piso = 1; piso <= 100; piso += 1) {
          const partida = new Partida({ generarPisoCritico: () => pisoCritico })
          partida.iniciar()
          const esperado = piso >= pisoCritico ? RESULTADO.SE_ROMPE : RESULTADO.SOBREVIVE
          expect(partida.lanzar(piso).lanzamiento.resultado).toBe(esperado)
        }
      }
    })

    it('rechaza pisos fuera de 1..100 sin modificar el estado (CP-02)', () => {
      const { partida } = partidaCon(40)
      for (const valor of [0, 101, -5, 2.5, '', 'abc', null, undefined]) {
        expect(partida.lanzar(valor)).toEqual({ tipo: TIPO_LANZAMIENTO.PISO_INVALIDO, valor })
      }
      expect([partida.huevosDisponibles, partida.intentos]).toEqual([2, 0])
    })

    it('acepta el piso escrito como texto', () => {
      const { partida } = partidaCon(40)
      expect(partida.lanzar(' 39 ').tipo).toBe(TIPO_LANZAMIENTO.REALIZADO)
    })

    it('descuenta un huevo por rotura y suma un intento por lanzamiento (CP-04, CP-05)', () => {
      const { partida } = partidaCon(40)
      partida.lanzar(20)
      expect([partida.huevosDisponibles, partida.intentos]).toEqual([2, 1])
      partida.lanzar(60)
      expect([partida.huevosDisponibles, partida.intentos]).toEqual([1, 2])
      partida.lanzar(30)
      expect([partida.huevosDisponibles, partida.intentos]).toEqual([1, 3])
      expect(partida.historial.map(({ numero, piso, resultado }) => [numero, piso, resultado])).toEqual([
        [1, 20, RESULTADO.SOBREVIVE],
        [2, 60, RESULTADO.SE_ROMPE],
        [3, 30, RESULTADO.SOBREVIVE],
      ])
    })
  })

  describe('inferencias y redundancia (RF-19, RF-20, CU-11)', () => {
    it('colorea solo lo que se deduce de los lanzamientos (CP-19)', () => {
      const { partida } = partidaCon(40)
      partida.lanzar(30)
      partida.lanzar(60)
      const estados = estadosDePisos(partida)
      expect(new Set(estados.slice(0, 30))).toEqual(new Set([SEGURO]))
      expect(new Set(estados.slice(30, 59))).toEqual(new Set([DESCONOCIDO]))
      expect(new Set(estados.slice(59))).toEqual(new Set([ROTURA]))
    })

    it('un intento redundante avisa y no altera huevos, contador ni historial (CP-20)', () => {
      const { partida } = partidaCon(40)
      partida.lanzar(30)
      partida.lanzar(60)
      const antes = partida.instantanea()
      expect(partida.lanzar(30)).toEqual({ tipo: TIPO_LANZAMIENTO.REDUNDANTE, piso: 30, estadoPiso: SEGURO })
      expect(partida.lanzar(10)).toMatchObject({ tipo: TIPO_LANZAMIENTO.REDUNDANTE, estadoPiso: SEGURO })
      expect(partida.lanzar(75)).toMatchObject({ tipo: TIPO_LANZAMIENTO.REDUNDANTE, estadoPiso: ROTURA })
      expect(partida.instantanea()).toEqual(antes)
    })
  })

  describe('declaración y fin de partida (RF-18, RN-10, RN-11, CU-10)', () => {
    it('acepta una declaración correcta y demostrada, y bloquea nuevos lanzamientos (CP-18)', () => {
      const { partida } = partidaCon(40)
      partida.lanzar(39)
      partida.lanzar(40)
      expect(partida.hayCerteza).toBe(true)
      expect(partida.declarar(40)).toMatchObject({
        tipo: TIPO_DECLARACION.CORRECTA,
        piso: 40,
        intentos: 2,
        evidencia: { maxSeguro: 39, minRotura: 40 },
      })
      expect(partida.estado).toBe(ESTADO_PARTIDA.RESUELTA)
      expect(partida.pisoCriticoRevelado).toBe(40)
      expect(partida.lanzar(50).tipo).toBe(TIPO_LANZAMIENTO.PARTIDA_INACTIVA)
      expect(partida.declarar(40).tipo).toBe(TIPO_DECLARACION.PARTIDA_INACTIVA)
    })

    it('sin certeza responde "sin evidencia" aunque la declaración coincida, para no revelar F (CP-18)', () => {
      const { partida } = partidaCon(40)
      partida.lanzar(30)
      const coincide = partida.declarar(40)
      const noCoincide = partida.declarar(35)
      expect(coincide.tipo).toBe(TIPO_DECLARACION.SIN_EVIDENCIA)
      expect(noCoincide.tipo).toBe(TIPO_DECLARACION.SIN_EVIDENCIA)
      expect(coincide.evidencia).toEqual(noCoincide.evidencia)
      expect(coincide.evidencia).toMatchObject({ desde: 31, hasta: 100 })
      expect(partida.estado).toBe(ESTADO_PARTIDA.EN_CURSO)
    })

    it('rechaza una declaración que contradice la evidencia y deja seguir jugando (CP-18)', () => {
      const { partida } = partidaCon(40)
      partida.lanzar(30)
      partida.lanzar(60)
      expect(partida.declarar(25).tipo).toBe(TIPO_DECLARACION.INCORRECTA)
      expect(partida.declarar(70).tipo).toBe(TIPO_DECLARACION.INCORRECTA)
      expect(partida.estado).toBe(ESTADO_PARTIDA.EN_CURSO)
      expect(partida.intentos).toBe(2)
    })

    it('exige declarar un piso entre 1 y 100', () => {
      const { partida } = partidaCon(40)
      expect(partida.declarar(0)).toEqual({ tipo: TIPO_DECLARACION.PISO_INVALIDO, valor: 0 })
      expect(partida.declarar('')).toEqual({ tipo: TIPO_DECLARACION.PISO_INVALIDO, valor: '' })
    })

    it('termina como no resuelta al agotar los huevos sin certeza (CP-18)', () => {
      const { partida } = partidaCon(40)
      partida.lanzar(60)
      const ultimo = partida.lanzar(50)
      expect(ultimo).toMatchObject({
        estadoPartida: ESTADO_PARTIDA.NO_RESUELTA,
        huevosDisponibles: 0,
        candidatos: { desde: 1, hasta: 50 },
        pisoCritico: 40,
      })
      expect(partida.lanzar(10).tipo).toBe(TIPO_LANZAMIENTO.PARTIDA_INACTIVA)
      expect(partida.declarar(40).tipo).toBe(TIPO_DECLARACION.PARTIDA_INACTIVA)
    })

    it('sin huevos pero con certeza, bloquea lanzamientos y permite declarar', () => {
      const { partida } = partidaCon(40)
      partida.lanzar(39)
      partida.lanzar(41)
      partida.lanzar(40)
      expect([partida.huevosDisponibles, partida.estado]).toEqual([0, ESTADO_PARTIDA.EN_CURSO])
      expect(partida.lanzar(45)).toEqual({ tipo: TIPO_LANZAMIENTO.SIN_HUEVOS, hayCerteza: true })
      expect(partida.declarar(41).tipo).toBe(TIPO_DECLARACION.INCORRECTA)
      expect(partida.declarar(40).tipo).toBe(TIPO_DECLARACION.CORRECTA)
    })

    it('demuestra F = 1 cuando el huevo se rompe en el piso 1', () => {
      const { partida } = partidaCon(1)
      partida.lanzar(1)
      expect(partida.declarar(1)).toMatchObject({
        tipo: TIPO_DECLARACION.CORRECTA,
        evidencia: { maxSeguro: 0, minRotura: 1 },
      })
    })

    it('demuestra F = 100 cuando el huevo sobrevive en el piso 99', () => {
      const { partida } = partidaCon(100)
      partida.lanzar(99)
      expect(partida.declarar(100)).toMatchObject({
        tipo: TIPO_DECLARACION.CORRECTA,
        evidencia: { maxSeguro: 99, minRotura: null },
      })
    })
  })

  describe('reinicio (RF-17, RN-12, CU-09)', () => {
    it('en curso pide confirmación y, sin ella, conserva la partida (CP-17)', () => {
      const { partida, generar } = partidaCon(40, 70)
      partida.lanzar(30)
      partida.lanzar(60)
      const antes = partida.instantanea()
      expect(partida.reiniciar()).toEqual({ reiniciada: false, requiereConfirmacion: true })
      expect(partida.instantanea()).toEqual(antes)
      expect(generar).toHaveBeenCalledTimes(1)
      expect(partida.lanzar(40).lanzamiento.resultado).toBe(RESULTADO.SE_ROMPE)
    })

    it('al confirmar genera otro F y restablece huevos, intentos, historial e inferencias (CP-17)', () => {
      const { partida, generar } = partidaCon(40, 70)
      partida.lanzar(30)
      partida.lanzar(60)
      expect(partida.reiniciar({ confirmado: true })).toEqual({ reiniciada: true, requiereConfirmacion: false })
      expect(generar).toHaveBeenCalledTimes(2)
      expect(partida.estado).toBe(ESTADO_PARTIDA.EN_CURSO)
      expect([partida.huevosDisponibles, partida.intentos]).toEqual([2, 0])
      expect(partida.historial).toEqual([])
      expect(new Set(estadosDePisos(partida))).toEqual(new Set([DESCONOCIDO]))
      expect(partida.lanzar(60).lanzamiento.resultado).toBe(RESULTADO.SOBREVIVE)
    })

    it('una partida terminada se reinicia sin confirmación', () => {
      const { partida } = partidaCon(1, 50)
      partida.lanzar(1)
      partida.declarar(1)
      expect(partida.reiniciar()).toEqual({ reiniciada: true, requiereConfirmacion: false })
      expect(partida.estado).toBe(ESTADO_PARTIDA.EN_CURSO)
    })
  })
})
