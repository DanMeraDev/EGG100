import { describe, expect, it } from 'vitest'
import { ESTRATEGIAS } from '../../componentes/opciones.js'
import {
  ID_ESTRATEGIA,
  obtenerEstrategia,
  obtenerEstrategiasDisponibles,
} from './RegistroEstrategias.js'
import { siguientePisoSaltosFijos } from './SaltosFijos.js'
import { siguientePisoSecuencial } from './Secuencial.js'

const estadoInicial = { maxSeguro: 0, minRotura: null, huevosDisponibles: 2, totalPisos: 100 }

describe('RegistroEstrategias (RF-07, CU-04)', () => {
  describe('obtenerEstrategiasDisponibles', () => {
    it('lista Secuencial y Saltos de 10, en ese orden', () => {
      const lista = obtenerEstrategiasDisponibles()
      expect(lista.map(({ id, nombre }) => ({ id, nombre }))).toEqual([
        { id: 'secuencial', nombre: 'Secuencial' },
        { id: 'saltos_10', nombre: 'Saltos de 10' },
      ])
    })

    it('cada estrategia trae una descripción para mostrar al usuario', () => {
      for (const { descripcion } of obtenerEstrategiasDisponibles()) {
        expect(typeof descripcion).toBe('string')
        expect(descripcion.length).toBeGreaterThan(0)
      }
    })

    it('los identificadores no se repiten y coinciden con ID_ESTRATEGIA', () => {
      const ids = obtenerEstrategiasDisponibles().map(({ id }) => id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids).toEqual([ID_ESTRATEGIA.SECUENCIAL, ID_ESTRATEGIA.SALTOS_10])
    })

    it('no deja que el llamador altere el catálogo', () => {
      const lista = obtenerEstrategiasDisponibles()
      expect(Object.isFrozen(lista)).toBe(true)
      expect(Object.isFrozen(lista[0])).toBe(true)
      expect(() => lista.push({ id: 'otra', nombre: 'Otra' })).toThrow(TypeError)
      expect(obtenerEstrategiasDisponibles()).toHaveLength(2)
    })

    it('usa los mismos identificadores y nombres que la interfaz', () => {
      for (const { id, nombre } of obtenerEstrategiasDisponibles()) {
        expect(ESTRATEGIAS.find((opcion) => opcion.id === id)).toMatchObject({ id, nombre })
      }
    })
  })

  describe('obtenerEstrategia', () => {
    it('devuelve la estrategia secuencial para "secuencial"', () => {
      const estrategia = obtenerEstrategia('secuencial')
      expect(estrategia).toBe(siguientePisoSecuencial)
      expect(estrategia(estadoInicial)).toBe(1)
    })

    it('devuelve la estrategia de saltos fijos para "saltos_10"', () => {
      const estrategia = obtenerEstrategia('saltos_10')
      expect(estrategia).toBe(siguientePisoSaltosFijos)
      expect(estrategia(estadoInicial)).toBe(10)
    })

    it('entrega una estrategia utilizable para cada id listado', () => {
      for (const { id } of obtenerEstrategiasDisponibles()) {
        const estrategia = obtenerEstrategia(id)
        expect(typeof estrategia).toBe('function')
        const piso = estrategia(estadoInicial)
        expect(Number.isInteger(piso) && piso >= 1 && piso <= 100).toBe(true)
      }
    })

    it('las estrategias obtenidas son independientes entre llamadas', () => {
      const primera = obtenerEstrategia('saltos_10')
      primera({ maxSeguro: 50, minRotura: null, huevosDisponibles: 2, totalPisos: 100 })
      expect(obtenerEstrategia('saltos_10')(estadoInicial)).toBe(10)
    })

    it('lanza un error claro si el identificador no existe', () => {
      expect(() => obtenerEstrategia('inexistente')).toThrow(
        'Estrategia desconocida: "inexistente". Estrategias disponibles: secuencial, saltos_10.',
      )
    })

    it('rechaza identificadores vacíos, de otro tipo, con otra capitalización o aún no disponibles', () => {
      for (const invalido of ['', undefined, null, 42, 'Secuencial', ' secuencial', 'optima', 'saltos_fijos_10']) {
        expect(() => obtenerEstrategia(invalido)).toThrow(/Estrategia desconocida/)
      }
    })
  })
})
