// Opciones que el usuario elige en la interfaz del prototipo V2.
export const MODO_PISO = Object.freeze({
  ALEATORIO: 'aleatorio',
  ELEGIDO: 'elegido',
})

// LÓGICA (RF-07, RF-08, RF-21): usar estos mismos identificadores al implementar las estrategias.
export const ESTRATEGIA = Object.freeze({
  SECUENCIAL: 'secuencial',
  SALTOS_10: 'saltos_10',
  OPTIMA: 'optima',
})

export const ESTRATEGIAS = Object.freeze([
  {
    id: ESTRATEGIA.SECUENCIAL,
    nombre: 'Secuencial',
    descripcion: 'Prueba los pisos 1, 2, 3… de uno en uno hasta que el huevo se rompe.',
    disponible: true,
  },
  {
    id: ESTRATEGIA.SALTOS_10,
    nombre: 'Saltos de 10',
    descripcion:
      'Prueba los pisos 10, 20, 30…; tras la primera rotura, revisa uno a uno los pisos desde el último seguro.',
    disponible: true,
  },
  {
    id: ESTRATEGIA.OPTIMA,
    nombre: 'Óptima',
    descripcion: 'Saltos decrecientes que nunca necesitan más de 14 lanzamientos.',
    disponible: false,
    aviso: 'Disponible en V3',
  },
])

// Valor de `menosLanzamientos` cuando las estrategias usaron los mismos lanzamientos (RF-10).
export const EMPATE = 'empate'

export function nombreEstrategia(id) {
  return ESTRATEGIAS.find((opcion) => opcion.id === id)?.nombre ?? id
}
