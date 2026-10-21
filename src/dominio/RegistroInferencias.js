import { TOTAL_PISOS } from './constantes.js'
import { RESULTADO } from './Lanzamiento.js'

export const ESTADO_PISO = Object.freeze({
  SEGURO: 'seguro',
  ROTURA: 'rotura',
  DESCONOCIDO: 'desconocido',
})

// Conocimiento que se deduce de los lanzamientos (RF-19, RF-20, RN-08 a RN-10). No conoce F.
export class RegistroInferencias {
  #totalPisos
  #maxSeguro = 0
  #minRotura = null

  constructor(totalPisos = TOTAL_PISOS) {
    this.#totalPisos = totalPisos
  }

  // Piso seguro más alto confirmado; 0 si aún no hay ninguno (RN-10).
  get maxSeguro() {
    return this.#maxSeguro
  }

  // Piso de rotura más bajo confirmado; null si ningún huevo se ha roto.
  get minRotura() {
    return this.#minRotura
  }

  registrar(piso, resultado) {
    if (resultado === RESULTADO.SOBREVIVE) {
      this.#maxSeguro = Math.max(this.#maxSeguro, piso)
    } else {
      this.#minRotura = this.#minRotura === null ? piso : Math.min(this.#minRotura, piso)
    }
  }

  // Solo se marca lo observado: sobrevivir en x confirma 1..x; romperse en x confirma x..N (RN-08).
  estadoDe(piso) {
    if (piso <= this.#maxSeguro) return ESTADO_PISO.SEGURO
    if (this.#minRotura !== null && piso >= this.#minRotura) return ESTADO_PISO.ROTURA
    return ESTADO_PISO.DESCONOCIDO
  }

  esRedundante(piso) {
    return this.estadoDe(piso) !== ESTADO_PISO.DESCONOCIDO
  }

  // Pisos donde aún puede estar F. Sin roturas, el tope es el último piso porque F ≤ N (D-05).
  get candidatos() {
    return { desde: this.#maxSeguro + 1, hasta: this.#minRotura ?? this.#totalPisos }
  }

  get pisoDeterminado() {
    const { desde, hasta } = this.candidatos
    return desde === hasta ? desde : null
  }
}
