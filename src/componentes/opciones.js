import { ID_ESTRATEGIA, obtenerEstrategiasDisponibles } from '../dominio/estrategias/RegistroEstrategias.js'

// Opciones que el usuario elige en la interfaz de los prototipos V2 y V3.
export const MODO_PISO = Object.freeze({
  ALEATORIO: 'aleatorio',
  ELEGIDO: 'elegido',
})

// Los identificadores de las estrategias implementadas son los del registro del dominio (RF-07).
export const ESTRATEGIA = Object.freeze({
  SECUENCIAL: ID_ESTRATEGIA.SECUENCIAL,
  SALTOS_10: ID_ESTRATEGIA.SALTOS_10,
  OPTIMA: ID_ESTRATEGIA.OPTIMA,
})

// Nombre y descripción vienen del registro; `disponible` indica que la opción se puede elegir.
const registradas = new Map(obtenerEstrategiasDisponibles().map((estrategia) => [estrategia.id, estrategia]))
const desdeRegistro = (id) => ({ ...registradas.get(id), disponible: true })

// Una opción con `disponible: false` se muestra bloqueada junto a su `aviso`.
export const ESTRATEGIAS = Object.freeze([
  desdeRegistro(ESTRATEGIA.SECUENCIAL),
  desdeRegistro(ESTRATEGIA.SALTOS_10),
  desdeRegistro(ESTRATEGIA.OPTIMA),
])

// Una estrategia se puede ejecutar si el registro del dominio la conoce.
export const estaRegistrada = (id) => registradas.has(id)

export function nombreEstrategia(id) {
  return ESTRATEGIAS.find((opcion) => opcion.id === id)?.nombre ?? id
}
