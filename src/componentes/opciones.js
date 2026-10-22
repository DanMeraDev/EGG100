// Opciones que el usuario elige en la interfaz de los prototipos V2 y V3.
export const MODO_PISO = Object.freeze({
  ALEATORIO: 'aleatorio',
  ELEGIDO: 'elegido',
})

// LÓGICA (RF-07, RF-08, RF-11, RF-21): usar estos mismos identificadores al implementar las estrategias.
export const ESTRATEGIA = Object.freeze({
  SECUENCIAL: 'secuencial',
  SALTOS_10: 'saltos_10',
  OPTIMA: 'optima',
})

// Una opción con `disponible: false` se muestra bloqueada junto a su `aviso`.
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
    descripcion: 'Empieza en el piso 14 y salta 13, 12, 11… pisos; nunca necesita más de 14 lanzamientos.',
    disponible: true,
  },
])

export function nombreEstrategia(id) {
  return ESTRATEGIAS.find((opcion) => opcion.id === id)?.nombre ?? id
}
