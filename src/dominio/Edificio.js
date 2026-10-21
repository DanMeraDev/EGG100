import { PISO_MINIMO, TOTAL_PISOS } from './constantes.js'

const ENTERO_POSITIVO = /^\s*\d+\s*$/

// Edificio con pisos numerados de 1 a N (RF-01, RF-02, RN-01).
export class Edificio {
  #totalPisos

  constructor(totalPisos = TOTAL_PISOS) {
    if (!Number.isInteger(totalPisos) || totalPisos < PISO_MINIMO) {
      throw new RangeError(`Cantidad de pisos no válida: ${totalPisos}`)
    }
    this.#totalPisos = totalPisos
  }

  get totalPisos() {
    return this.#totalPisos
  }

  get pisos() {
    return Array.from({ length: this.#totalPisos }, (_, indice) => PISO_MINIMO + indice)
  }

  esPisoValido(piso) {
    return Number.isInteger(piso) && piso >= PISO_MINIMO && piso <= this.#totalPisos
  }

  // Acepta números o el texto que escribe el usuario; devuelve null si no es un piso del edificio.
  interpretarPiso(valor) {
    const numero = typeof valor === 'string' && ENTERO_POSITIVO.test(valor) ? Number(valor) : valor
    return this.esPisoValido(numero) ? numero : null
  }
}
