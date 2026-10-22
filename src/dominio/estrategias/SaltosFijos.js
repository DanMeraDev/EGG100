import { TOTAL_PISOS } from '../constantes.js'
import { siguientePisoSecuencial } from './Secuencial.js'

export const SALTO = 10

// Estrategia de saltos fijos (V2, RF-21). Lógica pura: dice cuál es el siguiente piso a lanzar.
//
// 1. Con dos huevos y sin roturas, salta de `salto` en `salto` a partir del último piso seguro:
//    10, 20, 30… sin pasar del último piso.
// 2. Cuando el primer huevo se rompe queda uno solo: pasa a búsqueda secuencial desde el último piso
//    seguro + 1, hasta el piso anterior a la rotura confirmada, sin repetir pisos.
//
// `estado` tiene la misma forma que en `siguientePisoSecuencial`
// ({ maxSeguro, minRotura, huevosDisponibles, totalPisos }). Devuelve null si no hay nada que lanzar.
export function siguientePisoSaltosFijos(estado, salto = SALTO) {
  // Sin huevos o con F ya determinado, ambas fases coinciden: no hay piso que lanzar.
  const siguienteSecuencial = siguientePisoSecuencial(estado)
  if (siguienteSecuencial === null) {
    return null
  }

  const { maxSeguro, minRotura = null, huevosDisponibles, totalPisos = TOTAL_PISOS } = estado
  const enFaseDeSaltos = huevosDisponibles >= 2 && minRotura === null
  if (!enFaseDeSaltos) {
    return siguienteSecuencial
  }
  return Math.min(maxSeguro + salto, totalPisos)
}
