import { Lanzamiento } from './Lanzamiento.js'

// Lista ordenada de intentos contabilizados; los intentos redundantes nunca llegan aquí (RF-20).
export class Historial {
  #lanzamientos = []

  registrar(piso, resultado) {
    const lanzamiento = new Lanzamiento(this.#lanzamientos.length + 1, piso, resultado)
    this.#lanzamientos.push(lanzamiento)
    return lanzamiento
  }

  get total() {
    return this.#lanzamientos.length
  }

  get lanzamientos() {
    return [...this.#lanzamientos]
  }
}
