import { TOTAL_PISOS } from './constantes.js'

// RN-07: F uniforme en [1, totalPisos]. `aleatorio` se puede sustituir en las pruebas.
export function generarPisoCriticoAleatorio(totalPisos = TOTAL_PISOS, aleatorio = Math.random) {
  return Math.floor(aleatorio() * totalPisos) + 1
}
