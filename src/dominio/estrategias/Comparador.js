import { Partida } from '../Partida.js'
import { ejecutarEstrategia } from './Ejecutor.js'
import { siguientePisoOptima } from './EstrategiaOptima.js'
import { ID_ESTRATEGIA, obtenerEstrategia, obtenerEstrategiasDisponibles } from './RegistroEstrategias.js'
import { siguientePisoSaltosFijos } from './SaltosFijos.js'
import { siguientePisoSecuencial } from './Secuencial.js'

const ALIAS_ESTRATEGIA = Object.freeze({
  saltos_fijos_10: ID_ESTRATEGIA.SALTOS_10,
  saltos_fijos: ID_ESTRATEGIA.SALTOS_10,
})

function normalizarEntradaEstrategia(entrada) {
  if (typeof entrada === 'string') {
    const idResuelto = ALIAS_ESTRATEGIA[entrada] ?? entrada
    return {
      id: entrada,
      fn: obtenerEstrategia(idResuelto),
    }
  }
  if (typeof entrada === 'function') {
    if (entrada === siguientePisoSecuencial) {
      return { id: ID_ESTRATEGIA.SECUENCIAL, fn: entrada }
    }
    if (entrada === siguientePisoSaltosFijos) {
      return { id: ID_ESTRATEGIA.SALTOS_10, fn: entrada }
    }
    if (entrada === siguientePisoOptima) {
      return { id: ID_ESTRATEGIA.OPTIMA, fn: entrada }
    }
    return { id: entrada.name || 'personalizada', fn: entrada }
  }
  if (typeof entrada === 'object' && entrada !== null) {
    const rawId = entrada.id ?? entrada.nombre ?? 'personalizada'
    const idResuelto = ALIAS_ESTRATEGIA[rawId] ?? rawId
    const fn = entrada.ejecutar ?? entrada.fn ?? (typeof idResuelto === 'string' ? obtenerEstrategia(idResuelto) : null)
    if (typeof fn === 'function') {
      return { id: rawId, fn }
    }
  }
  throw new TypeError(`Estrategia no válida para comparación: ${String(entrada)}`)
}

// RF-10 (CU-06): evalúa y compara múltiples estrategias bajo el mismo piso crítico.
//
// Para cada estrategia instancia una nueva Partida con el `pisoCritico` indicado,
// la corre con el Ejecutor hasta determinar F y retorna el arreglo de resultados
// ordenado de menor a mayor cantidad de intentos (más eficiente primero).
export function compararEstrategias(
  pisoCritico,
  estrategiasAComparar = obtenerEstrategiasDisponibles().map((estrategia) => estrategia.id),
) {
  const lista = Array.isArray(estrategiasAComparar) ? estrategiasAComparar : [estrategiasAComparar]
  if (lista.length === 0) {
    return []
  }

  const resultados = lista.map((entrada) => {
    const { id, fn } = normalizarEntradaEstrategia(entrada)
    const partida = new Partida()
    partida.iniciar({ pisoCritico })
    const ejecucion = ejecutarEstrategia(partida, fn)

    return Object.freeze({
      id,
      ...ejecucion,
      intentos: ejecucion.intentos,
    })
  })

  return resultados.sort((a, b) => a.intentos - b.intentos)
}
