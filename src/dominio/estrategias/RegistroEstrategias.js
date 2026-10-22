import { siguientePisoOptima } from './EstrategiaOptima.js'
import { siguientePisoSaltosFijos } from './SaltosFijos.js'
import { siguientePisoSecuencial } from './Secuencial.js'

// Identificadores de las estrategias. Son los mismos que usa la interfaz (componentes/opciones.js).
export const ID_ESTRATEGIA = Object.freeze({
  SECUENCIAL: 'secuencial',
  SALTOS_10: 'saltos_10',
  OPTIMA: 'optima',
})

// Catálogo interno: metadatos que se muestran al usuario y la fábrica de cada estrategia.
// Para sumar una estrategia nueva (p. ej. la óptima de V3) basta con agregar una entrada aquí.
const CATALOGO = Object.freeze([
  {
    id: ID_ESTRATEGIA.SECUENCIAL,
    nombre: 'Secuencial',
    descripcion: 'Prueba los pisos 1, 2, 3… de uno en uno hasta que el huevo se rompe.',
    crear: () => siguientePisoSecuencial,
  },
  {
    id: ID_ESTRATEGIA.SALTOS_10,
    nombre: 'Saltos de 10',
    descripcion:
      'Prueba los pisos 10, 20, 30…; tras la primera rotura, revisa uno a uno los pisos desde el último seguro.',
    crear: () => siguientePisoSaltosFijos,
  },
  {
    id: ID_ESTRATEGIA.OPTIMA,
    nombre: 'Óptima',
    descripcion: 'Empieza en el piso 14 y salta 13, 12, 11… pisos; nunca necesita más de 14 lanzamientos.',
    crear: () => siguientePisoOptima,
  },
])

const METADATOS = Object.freeze(
  CATALOGO.map(({ id, nombre, descripcion }) => Object.freeze({ id, nombre, descripcion })),
)

// RF-07: estrategias que el usuario puede elegir, en el orden en que se muestran.
// Devuelve una lista inmutable de { id, nombre, descripcion }.
export function obtenerEstrategiasDisponibles() {
  return METADATOS
}

// RF-07: devuelve la estrategia asociada a `id`, lista para pasar a `ejecutarEstrategia`.
// Una estrategia es una función pura `(estado) => piso | null` (ver Secuencial.js y SaltosFijos.js);
// no guarda estado entre llamadas, así que cada ejecución es independiente.
// Lanza un error si el identificador no existe.
export function obtenerEstrategia(id) {
  const entrada = CATALOGO.find((estrategia) => estrategia.id === id)
  if (entrada === undefined) {
    const disponibles = CATALOGO.map((estrategia) => estrategia.id).join(', ')
    throw new Error(`Estrategia desconocida: ${JSON.stringify(id)}. Estrategias disponibles: ${disponibles}.`)
  }
  return entrada.crear()
}
