export const RESULTADO = Object.freeze({
  SE_ROMPE: 'se_rompe',
  SOBREVIVE: 'sobrevive',
})

// RF-03 / RN-02: sobrevive por debajo de F; se rompe desde F hacia arriba.
export function determinarResultado(piso, pisoCritico) {
  return piso >= pisoCritico ? RESULTADO.SE_ROMPE : RESULTADO.SOBREVIVE
}

// Intento contabilizado e inmutable (RF-05, RF-09).
export class Lanzamiento {
  constructor(numero, piso, resultado) {
    this.numero = numero
    this.piso = piso
    this.resultado = resultado
    Object.freeze(this)
  }

  get seRompio() {
    return this.resultado === RESULTADO.SE_ROMPE
  }
}
