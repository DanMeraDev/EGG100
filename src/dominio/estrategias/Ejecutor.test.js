import { describe, expect, it, vi } from 'vitest'
import { ESTADO_PARTIDA, Partida, TIPO_LANZAMIENTO } from '../Partida.js'
import { RESULTADO } from '../Lanzamiento.js'
import { ejecutarEstrategia, MOTIVO_FIN } from './Ejecutor.js'
import { siguientePisoSaltosFijos } from './SaltosFijos.js'
import { siguientePisoSecuencial } from './Secuencial.js'

function partidaCon(pisoCritico) {
  const partida = new Partida()
  partida.iniciar({ pisoCritico })
  return partida
}

const pisosLanzados = (resultado) => resultado.lanzamientos.map(({ piso }) => piso)

describe('ejecutarEstrategia (RF-08, CU-05)', () => {
  describe('estrategia secuencial', () => {
    it('con F = 40 lanza 1, 2, 3… 40, identifica F y deja la partida resuelta', () => {
      const partida = partidaCon(40)
      const resultado = ejecutarEstrategia(partida, siguientePisoSecuencial)

      expect(partida.estado).toBe(ESTADO_PARTIDA.RESUELTA)
      expect(resultado).toMatchObject({
        resuelta: true,
        motivo: MOTIVO_FIN.RESUELTA,
        pisoIdentificado: 40,
        pisoCritico: 40,
        intentos: 40,
        huevosRotos: 1,
        rechazo: null,
      })
      expect(pisosLanzados(resultado)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
      expect(resultado.lanzamientos.map(({ numero }) => numero)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
      expect(resultado.lanzamientos.at(-1).resultado).toBe(RESULTADO.SE_ROMPE)
    })

    it('con F = 1 resuelve con un solo lanzamiento', () => {
      const resultado = ejecutarEstrategia(partidaCon(1), siguientePisoSecuencial)
      expect(resultado).toMatchObject({ resuelta: true, pisoIdentificado: 1, intentos: 1, huevosRotos: 1 })
    })

    it('con F = 100 sobrevive hasta el 99 sin romper huevos y declara 100', () => {
      const resultado = ejecutarEstrategia(partidaCon(100), siguientePisoSecuencial)
      expect(resultado).toMatchObject({ resuelta: true, pisoIdentificado: 100, intentos: 99, huevosRotos: 0 })
    })

    it('para cada F de 1 a 100 resuelve con min(F, 99) intentos y a lo sumo un huevo roto', () => {
      for (let pisoCritico = 1; pisoCritico <= 100; pisoCritico += 1) {
        const resultado = ejecutarEstrategia(partidaCon(pisoCritico), siguientePisoSecuencial)
        expect(resultado.resuelta).toBe(true)
        expect(resultado.pisoIdentificado).toBe(pisoCritico)
        expect(resultado.intentos).toBe(Math.min(pisoCritico, 99))
        expect(resultado.huevosRotos).toBe(pisoCritico <= 99 ? 1 : 0)
      }
    })
  })

  describe('estrategia de saltos fijos de diez pisos', () => {
    it('con F = 40 lanza 10, 20, 30, 40 y luego 31 a 39 (13 intentos, un huevo roto)', () => {
      const partida = partidaCon(40)
      const resultado = ejecutarEstrategia(partida, siguientePisoSaltosFijos)

      expect(partida.estado).toBe(ESTADO_PARTIDA.RESUELTA)
      expect(pisosLanzados(resultado)).toEqual([10, 20, 30, 40, 31, 32, 33, 34, 35, 36, 37, 38, 39])
      expect(resultado).toMatchObject({
        resuelta: true,
        motivo: MOTIVO_FIN.RESUELTA,
        pisoIdentificado: 40,
        intentos: 13,
        huevosRotos: 1,
      })
    })

    it('con F = 35 rompe el segundo huevo exactamente en F y aun así resuelve', () => {
      const partida = partidaCon(35)
      const resultado = ejecutarEstrategia(partida, siguientePisoSaltosFijos)
      expect(pisosLanzados(resultado)).toEqual([10, 20, 30, 40, 31, 32, 33, 34, 35])
      expect(resultado).toMatchObject({ resuelta: true, pisoIdentificado: 35, intentos: 9, huevosRotos: 2 })
      expect(partida.huevosDisponibles).toBe(0)
    })

    it('con F = 1 y F = 100 resuelve en los extremos del edificio', () => {
      expect(ejecutarEstrategia(partidaCon(1), siguientePisoSaltosFijos)).toMatchObject({
        resuelta: true,
        pisoIdentificado: 1,
        intentos: 2,
        huevosRotos: 2,
      })
      expect(ejecutarEstrategia(partidaCon(100), siguientePisoSaltosFijos)).toMatchObject({
        resuelta: true,
        pisoIdentificado: 100,
        intentos: 19,
        huevosRotos: 1,
      })
    })

    it('para cada F de 1 a 100 identifica F con a lo sumo dos huevos y los intentos esperados', () => {
      for (let pisoCritico = 1; pisoCritico <= 100; pisoCritico += 1) {
        const resultado = ejecutarEstrategia(partidaCon(pisoCritico), siguientePisoSaltosFijos)
        const primerSaltoQueRompe = Math.ceil(pisoCritico / 10) * 10
        const multiploDeDiez = pisoCritico === primerSaltoQueRompe
        const intentosEsperados =
          primerSaltoQueRompe / 10 + (multiploDeDiez ? 9 : pisoCritico - primerSaltoQueRompe + 10)

        expect(resultado.resuelta).toBe(true)
        expect(resultado.pisoIdentificado).toBe(pisoCritico)
        expect(resultado.intentos).toBe(intentosEsperados)
        expect(resultado.huevosRotos).toBe(multiploDeDiez ? 1 : 2)
        expect(new Set(pisosLanzados(resultado)).size).toBe(resultado.intentos)
      }
    })
  })

  describe('resultado', () => {
    it('ofrece la información que muestra la interfaz de estrategias (RF-09)', () => {
      const resultado = ejecutarEstrategia(partidaCon(40), siguientePisoSecuencial)
      expect(Object.keys(resultado).sort()).toEqual(
        [
          'huevosRotos',
          'intentos',
          'lanzamientos',
          'motivo',
          'pisoCritico',
          'pisoIdentificado',
          'pisos',
          'rechazo',
          'resuelta',
        ].sort(),
      )
      expect(resultado.pisos).toHaveLength(100)
      expect(resultado.pisos.slice(0, 39).every(({ estado }) => estado === 'seguro')).toBe(true)
      expect(resultado.pisos[39].estado).toBe('rotura')
      expect(Object.isFrozen(resultado)).toBe(true)
    })

    it('la estrategia recibe el estado de la partida deducido de lo ya lanzado', () => {
      const estrategia = vi.fn(siguientePisoSaltosFijos)
      ejecutarEstrategia(partidaCon(25), estrategia)

      expect(estrategia.mock.calls[0][0]).toEqual({ maxSeguro: 0, minRotura: null, huevosDisponibles: 2, totalPisos: 100 })
      expect(estrategia.mock.calls[2][0]).toEqual({ maxSeguro: 20, minRotura: null, huevosDisponibles: 2, totalPisos: 100 })
      expect(estrategia.mock.calls[3][0]).toEqual({ maxSeguro: 20, minRotura: 30, huevosDisponibles: 1, totalPisos: 100 })
    })
  })

  describe('protección contra bucles infinitos y partidas sin resolver', () => {
    it('no hace nada si la partida no está en curso', () => {
      const estrategia = vi.fn()
      const resultado = ejecutarEstrategia(new Partida(), estrategia)
      expect(estrategia).not.toHaveBeenCalled()
      expect(resultado).toMatchObject({ resuelta: false, motivo: MOTIVO_FIN.PARTIDA_INACTIVA, intentos: 0 })
    })

    it('se detiene si la estrategia no devuelve ningún piso', () => {
      const partida = partidaCon(40)
      const resultado = ejecutarEstrategia(partida, () => null)
      expect(resultado).toMatchObject({ resuelta: false, motivo: MOTIVO_FIN.SIN_PISO, intentos: 0 })
      expect(partida.estado).toBe(ESTADO_PARTIDA.EN_CURSO)
    })

    it('se detiene ante un piso inválido sin modificar la partida', () => {
      for (const invalido of [0, 101, 2.5, 'abc']) {
        const partida = partidaCon(40)
        const resultado = ejecutarEstrategia(partida, () => invalido)
        expect(resultado.motivo).toBe(MOTIVO_FIN.LANZAMIENTO_RECHAZADO)
        expect(resultado.rechazo.tipo).toBe(TIPO_LANZAMIENTO.PISO_INVALIDO)
        expect([resultado.intentos, partida.huevosDisponibles]).toEqual([0, 2])
      }
    })

    it('se detiene si la estrategia repite un piso ya conocido, sin contar el intento redundante', () => {
      const partida = partidaCon(40)
      const resultado = ejecutarEstrategia(partida, () => 30)
      expect(resultado.motivo).toBe(MOTIVO_FIN.LANZAMIENTO_RECHAZADO)
      expect(resultado.rechazo.tipo).toBe(TIPO_LANZAMIENTO.REDUNDANTE)
      expect(resultado.intentos).toBe(1)
      expect(partida.estado).toBe(ESTADO_PARTIDA.EN_CURSO)
    })

    it('si se agotan los huevos sin determinar F, termina como no resuelta y revela F', () => {
      const pisos = [50, 45]
      const partida = partidaCon(40)
      const resultado = ejecutarEstrategia(partida, () => pisos.shift() ?? null)

      expect(partida.estado).toBe(ESTADO_PARTIDA.NO_RESUELTA)
      expect(resultado).toMatchObject({
        resuelta: false,
        motivo: MOTIVO_FIN.SIN_HUEVOS,
        pisoIdentificado: null,
        pisoCritico: 40,
        intentos: 2,
        huevosRotos: 2,
      })
    })

    it('una estrategia que siempre devuelve pisos nuevos termina antes de agotar el límite de vueltas', () => {
      let siguiente = 0
      const resultado = ejecutarEstrategia(partidaCon(100), () => {
        siguiente += 1
        return siguiente
      })
      expect(resultado.resuelta).toBe(true)
      expect(resultado.intentos).toBe(99)
    })

    it('corta tras totalPisos + 1 vueltas aunque Partida siga aceptando lanzamientos', () => {
      const lanzar = vi.fn(() => ({ tipo: TIPO_LANZAMIENTO.REALIZADO }))
      const partidaFalsa = {
        enCurso: true,
        estado: ESTADO_PARTIDA.EN_CURSO,
        hayCerteza: false,
        historial: [],
        huevosIniciales: 2,
        huevosDisponibles: 2,
        pisoCriticoRevelado: null,
        edificio: { totalPisos: 100 },
        lanzar,
        instantanea: () => ({ historial: [], pisos: [] }),
      }
      const resultado = ejecutarEstrategia(partidaFalsa, () => 1)
      expect(resultado.motivo).toBe(MOTIVO_FIN.LIMITE_ITERACIONES)
      expect(lanzar).toHaveBeenCalledTimes(101)
    })
  })
})
