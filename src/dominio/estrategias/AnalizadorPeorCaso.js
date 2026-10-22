import { TOTAL_PISOS } from '../constantes.js'
import { Edificio } from '../Edificio.js'
import { Partida } from '../Partida.js'
import { ejecutarEstrategia } from './Ejecutor.js'
import { siguientePisoOptima } from './EstrategiaOptima.js'
import {
  ID_ESTRATEGIA,
  obtenerEstrategia,
  obtenerEstrategiasDisponibles,
} from './RegistroEstrategias.js'
import { siguientePisoSaltosFijos } from './SaltosFijos.js'
import { siguientePisoSecuencial } from './Secuencial.js'

const ALIAS_ESTRATEGIA = Object.freeze({
  saltos_fijos_10: ID_ESTRATEGIA.SALTOS_10,
  saltos_fijos: ID_ESTRATEGIA.SALTOS_10,
})

function normalizarEstrategia(entrada) {
  if (typeof entrada === 'string') {
    const idResuelto = ALIAS_ESTRATEGIA[entrada] ?? entrada
    return {
      estrategiaId: entrada,
      fn: obtenerEstrategia(idResuelto),
    }
  }
  if (typeof entrada === 'function') {
    if (entrada === siguientePisoSecuencial) {
      return { estrategiaId: ID_ESTRATEGIA.SECUENCIAL, fn: entrada }
    }
    if (entrada === siguientePisoSaltosFijos) {
      return { estrategiaId: ID_ESTRATEGIA.SALTOS_10, fn: entrada }
    }
    if (entrada === siguientePisoOptima) {
      return { estrategiaId: ID_ESTRATEGIA.OPTIMA, fn: entrada }
    }
    return { estrategiaId: entrada.name || 'personalizada', fn: entrada }
  }
  if (typeof entrada === 'object' && entrada !== null) {
    const rawId = entrada.id ?? entrada.nombre ?? 'personalizada'
    const idResuelto = ALIAS_ESTRATEGIA[rawId] ?? rawId
    const fn =
      entrada.ejecutar ??
      entrada.fn ??
      (typeof idResuelto === 'string' ? obtenerEstrategia(idResuelto) : null)
    if (typeof fn === 'function') {
      return { estrategiaId: rawId, fn }
    }
  }
  throw new TypeError(`Estrategia no válida para análisis: ${String(entrada)}`)
}

// Analizador del peor caso (V3, RF-13).
//
// Evalúa una estrategia contra los N escenarios posibles (F = 1…totalPisos),
// registrando el número de intentos que tomó identificar cada piso crítico.
//
// Retorna un objeto con:
// - estrategiaId: identificador de la estrategia
// - maxIntentos: mayor número de intentos requerido en cualquier escenario
// - peorCaso: alias de maxIntentos
// - pisosPeorCaso: arreglo de pisos críticos donde se produjo dicho máximo
// - casos: detalle inmutable de cada escenario [{ pisoCritico, intentos, resuelta, huevosRotos }]
export function analizarPeorCaso(estrategia, totalPisos = TOTAL_PISOS) {
  if (!Number.isInteger(totalPisos) || totalPisos < 1) {
    throw new RangeError(`Total de pisos debe ser un entero positivo: ${String(totalPisos)}`)
  }

  const { estrategiaId, fn } = normalizarEstrategia(estrategia)
  const edificio = new Edificio(totalPisos)
  const casos = []
  let maxIntentos = 0

  for (let pisoCritico = 1; pisoCritico <= totalPisos; pisoCritico += 1) {
    const partida = new Partida({ edificio })
    partida.iniciar({ pisoCritico })
    const resultado = ejecutarEstrategia(partida, fn)

    casos.push(
      Object.freeze({
        pisoCritico,
        intentos: resultado.intentos,
        resuelta: resultado.resuelta,
        huevosRotos: resultado.huevosRotos,
      }),
    )

    if (resultado.intentos > maxIntentos) {
      maxIntentos = resultado.intentos
    }
  }

  const pisosPeorCaso = casos
    .filter((caso) => caso.intentos === maxIntentos)
    .map((caso) => caso.pisoCritico)

  return Object.freeze({
    estrategiaId,
    maxIntentos,
    peorCaso: maxIntentos,
    pisosPeorCaso: Object.freeze(pisosPeorCaso),
    casos: Object.freeze(casos),
  })
}

// Analiza todas las estrategias registradas (RF-13, RF-14, CU-08).
//
// Ejecuta `analizarPeorCaso` para cada estrategia y compila:
// - peorCaso: mapa { [id]: maxIntentos }
// - menorPeorCaso: lista de IDs de las estrategias con el mínimo peor caso
// - optimaValida: booleano que certifica si la estrategia óptima nunca superó los 14 lanzamientos
// - resultados: lista con el análisis detallado de cada estrategia
export function analizarTodasLasEstrategias(
  totalPisos = TOTAL_PISOS,
  estrategias = obtenerEstrategiasDisponibles().map((e) => e.id),
) {
  const lista = Array.isArray(estrategias) ? estrategias : [estrategias]
  const resultados = lista.map((entrada) => analizarPeorCaso(entrada, totalPisos))

  const peorCaso = {}
  for (const res of resultados) {
    peorCaso[res.estrategiaId] = res.maxIntentos
  }

  const valores = Object.values(peorCaso)
  const minPeorCaso = valores.length > 0 ? Math.min(...valores) : null
  const menorPeorCaso =
    minPeorCaso !== null
      ? Object.keys(peorCaso).filter((id) => peorCaso[id] === minPeorCaso)
      : []

  const optimaMax = peorCaso[ID_ESTRATEGIA.OPTIMA] ?? null
  const optimaValida = optimaMax !== null ? optimaMax <= 14 : true

  return Object.freeze({
    peorCaso: Object.freeze(peorCaso),
    menorPeorCaso: Object.freeze(menorPeorCaso),
    optimaValida,
    resultados: Object.freeze(resultados),
  })
}

// Compara los peores casos de las estrategias ordenados de menor a mayor (RF-14).
//
// Utiliza `analizarTodasLasEstrategias` y retorna un arreglo ordenado ascendentemente
// por la cantidad de lanzamientos en el peor caso, garantizando que la estrategia
// Óptima se posicione en el primer lugar como la más eficiente (14 lanzamientos).
export function compararPeoresCasos(
  totalPisos = TOTAL_PISOS,
  estrategias = obtenerEstrategiasDisponibles().map((e) => e.id),
) {
  let pisos = totalPisos
  let lista = estrategias

  if (Array.isArray(totalPisos)) {
    lista = totalPisos
    pisos = TOTAL_PISOS
  }

  const { resultados } = analizarTodasLasEstrategias(pisos, lista)
  const catalogo = new Map(obtenerEstrategiasDisponibles().map((e) => [e.id, e]))

  const ordenados = resultados.map((item) => {
    const metadatos = catalogo.get(item.estrategiaId)
    return Object.freeze({
      id: item.estrategiaId,
      estrategiaId: item.estrategiaId,
      nombre: metadatos?.nombre ?? item.estrategiaId,
      peorCaso: item.maxIntentos,
      maxIntentos: item.maxIntentos,
      pisosPeorCaso: item.pisosPeorCaso,
      casos: item.casos,
    })
  })

  return ordenados.sort((a, b) => a.peorCaso - b.peorCaso)
}

