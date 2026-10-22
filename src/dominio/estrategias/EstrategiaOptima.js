import { TOTAL_PISOS } from '../constantes.js'
import { siguientePisoSecuencial } from './Secuencial.js'

export const SALTO_INICIAL = 14

// Secuencia óptima para 100 pisos (RF-11).
// Saltos decrecientes: 14 (+14), 27 (+13), 39 (+12), 50 (+11), 60 (+10), 69 (+9),
// 77 (+8), 84 (+7), 90 (+6), 95 (+5), 99 (+4), y si sobrevive al 99, el 100 (+1).
export const SECUENCIA_SALTOS_OPTIMA = Object.freeze([
  14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100,
])

// Genera la secuencia de saltos decrecientes a partir del tamaño inicial.
// Si totalPisos es 100 y saltoInicial es 14, genera exactamente SECUENCIA_SALTOS_OPTIMA.
export function generarSecuenciaOptima(totalPisos = TOTAL_PISOS, saltoInicial = SALTO_INICIAL) {
  const secuencia = []
  let piso = 0
  let salto = saltoInicial
  while (piso < totalPisos && salto > 0) {
    piso = Math.min(piso + salto, totalPisos)
    secuencia.push(piso)
    if (piso >= totalPisos) break
    salto -= 1
  }
  if (piso < totalPisos) {
    secuencia.push(totalPisos)
  }
  return Object.freeze(secuencia)
}

// Estrategia óptima de saltos decrecientes (V3, RF-11). Lógica pura: dice cuál es el siguiente piso a lanzar.
//
// 1. Con dos huevos y sin roturas, el tamaño del salto disminuye en 1 en cada intento seguro:
//    14, 27 (+13), 39 (+12), 50 (+11), 60 (+10), 69 (+9), 77 (+8), 84 (+7), 90 (+6), 95 (+5), 99 (+4), y si sobrevive, el 100.
//    Esto garantiza encontrar F en un máximo de 14 lanzamientos en un edificio de 100 pisos.
// 2. Si el primer huevo se rompe (queda 1 huevo), la estrategia cambia inmediatamente a búsqueda
//    secuencial desde el último piso seguro + 1 hasta el piso anterior a la rotura confirmada, sin repetir pisos.
//
// `estado` tiene la forma { maxSeguro, minRotura, huevosDisponibles, totalPisos }.
// Devuelve null si no hay nada que lanzar (sin huevos, edificio completado o F ya determinado).
export function siguientePisoOptima(estado, secuencia = SECUENCIA_SALTOS_OPTIMA) {
  const { maxSeguro = 0, minRotura = null, huevosDisponibles, totalPisos = TOTAL_PISOS } = estado

  if (huevosDisponibles < 1) {
    return null
  }

  const enFaseDeSaltos = huevosDisponibles >= 2 && minRotura === null
  if (!enFaseDeSaltos) {
    return siguientePisoSecuencial(estado)
  }

  const listaSaltos =
    secuencia !== SECUENCIA_SALTOS_OPTIMA || totalPisos === TOTAL_PISOS
      ? secuencia
      : generarSecuenciaOptima(totalPisos)

  const siguienteSalto = listaSaltos.find((piso) => piso > maxSeguro && piso <= totalPisos)
  return siguienteSalto ?? null
}
