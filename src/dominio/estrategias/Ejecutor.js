import { ESTADO_PARTIDA, TIPO_DECLARACION, TIPO_LANZAMIENTO } from '../Partida.js'
import { RESULTADO } from '../Lanzamiento.js'

export const MOTIVO_FIN = Object.freeze({
  RESUELTA: 'resuelta',
  SIN_HUEVOS: 'sin_huevos',
  PARTIDA_INACTIVA: 'partida_inactiva',
  SIN_PISO: 'sin_piso',
  LANZAMIENTO_RECHAZADO: 'lanzamiento_rechazado',
  DECLARACION_RECHAZADA: 'declaracion_rechazada',
  LIMITE_ITERACIONES: 'limite_iteraciones',
})

// Lo que ve una estrategia (misma forma que en Secuencial.js y SaltosFijos.js), deducido del historial.
function estadoParaEstrategia(partida) {
  let maxSeguro = 0
  let minRotura = null
  for (const { piso, resultado } of partida.historial) {
    if (resultado === RESULTADO.SOBREVIVE) {
      maxSeguro = Math.max(maxSeguro, piso)
    } else {
      minRotura = minRotura === null ? piso : Math.min(minRotura, piso)
    }
  }
  return {
    maxSeguro,
    minRotura,
    huevosDisponibles: partida.huevosDisponibles,
    totalPisos: partida.edificio.totalPisos,
  }
}

function motivoSegunEstado(partida) {
  if (partida.estado === ESTADO_PARTIDA.RESUELTA) return MOTIVO_FIN.RESUELTA
  if (partida.estado === ESTADO_PARTIDA.NO_RESUELTA) return MOTIVO_FIN.SIN_HUEVOS
  return MOTIVO_FIN.PARTIDA_INACTIVA
}

// Motor de ejecución automática (RF-08): juega una partida ya iniciada con una estrategia hasta hallar F.
//
// `estrategia(estado)` devuelve el siguiente piso a lanzar o null (ver Secuencial.js y SaltosFijos.js).
// En cada vuelta: si la evidencia ya determina un único piso crítico, lo declara; si no, pide el siguiente
// piso a la estrategia y lo lanza con `Partida.lanzar`. Usa las mismas reglas que el modo manual, así que
// nunca usa más de los huevos de la partida ni cuenta intentos redundantes.
//
// Nunca se cuelga: se detiene si la estrategia no devuelve piso, si Partida rechaza un lanzamiento (piso
// inválido, redundante o sin huevos), si la declaración es rechazada, o tras `totalPisos` vueltas, que es
// el máximo de lanzamientos distintos posibles más la declaración final.
export function ejecutarEstrategia(partida, estrategia) {
  const maximoDeVueltas = partida.edificio.totalPisos + 1
  let motivo = null
  let rechazo = null
  let pisoIdentificado = null

  let vueltas = 0
  while (partida.enCurso && motivo === null) {
    if (vueltas >= maximoDeVueltas) {
      motivo = MOTIVO_FIN.LIMITE_ITERACIONES
      break
    }
    vueltas += 1

    if (partida.hayCerteza) {
      const piso = partida.candidatos.desde
      const declaracion = partida.declarar(piso)
      if (declaracion.tipo === TIPO_DECLARACION.CORRECTA) {
        pisoIdentificado = piso
      } else {
        motivo = MOTIVO_FIN.DECLARACION_RECHAZADA
        rechazo = declaracion
      }
      continue
    }

    const siguiente = estrategia(estadoParaEstrategia(partida))
    if (siguiente === null || siguiente === undefined) {
      motivo = MOTIVO_FIN.SIN_PISO
      continue
    }

    const lanzamiento = partida.lanzar(siguiente)
    if (lanzamiento.tipo !== TIPO_LANZAMIENTO.REALIZADO) {
      motivo = MOTIVO_FIN.LANZAMIENTO_RECHAZADO
      rechazo = lanzamiento
    }
  }

  const resuelta = partida.estado === ESTADO_PARTIDA.RESUELTA
  const { historial, pisos } = partida.instantanea()
  return Object.freeze({
    resuelta,
    motivo: motivo ?? motivoSegunEstado(partida),
    pisoIdentificado: resuelta ? pisoIdentificado : null,
    pisoCritico: partida.pisoCriticoRevelado,
    lanzamientos: historial,
    intentos: historial.length,
    huevosRotos: partida.huevosIniciales - partida.huevosDisponibles,
    pisos,
    rechazo,
  })
}
