import { RESULTADO } from '../dominio/Lanzamiento.js'
import { ESTADO_PARTIDA } from '../dominio/Partida.js'
import { ESTADO_PISO } from '../dominio/RegistroInferencias.js'

export const ETIQUETA_ESTADO_PISO = Object.freeze({
  [ESTADO_PISO.SEGURO]: 'seguro',
  [ESTADO_PISO.ROTURA]: 'rotura',
  [ESTADO_PISO.DESCONOCIDO]: 'desconocido',
})

export const ETIQUETA_ESTADO_PARTIDA = Object.freeze({
  [ESTADO_PARTIDA.SIN_INICIAR]: 'Sin iniciar',
  [ESTADO_PARTIDA.EN_CURSO]: 'En curso',
  [ESTADO_PARTIDA.RESUELTA]: 'Resuelta',
  [ESTADO_PARTIDA.NO_RESUELTA]: 'No resuelta',
})

export const ETIQUETA_RESULTADO = Object.freeze({
  [RESULTADO.SE_ROMPE]: 'Roto',
  [RESULTADO.SOBREVIVE]: 'Intacto',
})
