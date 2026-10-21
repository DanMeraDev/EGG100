import { HUEVOS_INICIALES } from './constantes.js'

// Huevos de una partida (RF-04, RN-03): el que sobrevive se reutiliza; el roto ya no.
export class ControlHuevos {
  #iniciales
  #rotos = 0

  constructor(iniciales = HUEVOS_INICIALES) {
    this.#iniciales = iniciales
  }

  get iniciales() {
    return this.#iniciales
  }

  get rotos() {
    return this.#rotos
  }

  get disponibles() {
    return this.#iniciales - this.#rotos
  }

  get hayDisponibles() {
    return this.disponibles > 0
  }

  romper() {
    if (!this.hayDisponibles) {
      throw new Error('No quedan huevos disponibles')
    }
    this.#rotos += 1
  }
}
