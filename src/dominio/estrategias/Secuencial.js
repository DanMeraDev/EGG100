import { TOTAL_PISOS } from '../constantes.js'

// Estrategia secuencial (V2): prueba los pisos de uno en uno, siempre desde el último piso seguro + 1.
//
// Lógica pura: recibe lo que ya se sabe de la partida y responde «¿cuál es el siguiente piso a lanzar?».
// No lanza huevos ni conoce F; el motor que ejecuta la partida es otro módulo (Issue #12).
//
// estado = {
//   maxSeguro,          // piso seguro más alto confirmado; 0 si aún no hay ninguno (RegistroInferencias.maxSeguro)
//   minRotura,          // piso de rotura más bajo confirmado; null si ningún huevo se ha roto
//   huevosDisponibles,  // huevos que quedan
//   totalPisos,         // opcional; 100 por defecto
// }
//
// Devuelve el número de piso, o null cuando no hay nada que lanzar: sin huevos o con F ya determinado
// (no quedan pisos desconocidos entre maxSeguro y minRotura, o hasta el último piso si no hubo roturas).
export function siguientePisoSecuencial({ maxSeguro, minRotura = null, huevosDisponibles, totalPisos = TOTAL_PISOS }) {
  if (huevosDisponibles < 1) {
    return null
  }
  const desde = maxSeguro + 1
  const hasta = minRotura ?? totalPisos
  return desde < hasta ? desde : null
}
