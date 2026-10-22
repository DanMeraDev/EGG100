import { RESULTADO } from '../dominio/Lanzamiento.js'
import { ESTADO_PARTIDA, TIPO_DECLARACION, TIPO_LANZAMIENTO } from '../dominio/Partida.js'
import { ESTADO_PISO } from '../dominio/RegistroInferencias.js'
import { nombreEstrategia } from './opciones.js'

// Convierte los resultados del dominio en mensajes explicados para el usuario (RF-18, RNF-01).
export const TONO = Object.freeze({
  NEUTRO: 'neutro',
  SEGURO: 'seguro',
  ROTURA: 'rotura',
  AVISO: 'aviso',
  ERROR: 'error',
  EXITO: 'exito',
})

export const MENSAJE_INICIAL = Object.freeze({
  tono: TONO.NEUTRO,
  texto: 'Partida iniciada. Selecciona un piso y pulsa «Lanzar».',
})

export const MENSAJE_REINICIO = Object.freeze({
  tono: TONO.NEUTRO,
  texto: 'Partida reiniciada con un nuevo piso crítico oculto. Selecciona un piso y pulsa «Lanzar».',
})

export const MENSAJE_REINICIO_CANCELADO = Object.freeze({
  tono: TONO.NEUTRO,
  texto: 'Reinicio cancelado: la partida continúa sin cambios.',
})

const MENSAJE_PARTIDA_TERMINADA = Object.freeze({
  tono: TONO.AVISO,
  texto: 'La partida ya terminó. Pulsa «Reiniciar» para jugar otra vez.',
})

const MENSAJE_PARTIDA_EN_CURSO = Object.freeze({
  tono: TONO.NEUTRO,
  texto: 'Partida en curso. Selecciona un piso y pulsa «Lanzar».',
})

export const MENSAJE_INICIAL_ESTRATEGIAS = Object.freeze({
  tono: TONO.NEUTRO,
  texto: 'Elige una estrategia, indica el piso crítico y pulsa «Ejecutar».',
})

// Mensaje al mostrar la simulación manual, también al volver desde otra vista.
export function mensajeAlMostrarPartida({ estado, intentos }) {
  if (estado !== ESTADO_PARTIDA.EN_CURSO) return MENSAJE_PARTIDA_TERMINADA
  return intentos === 0 ? MENSAJE_INICIAL : MENSAJE_PARTIDA_EN_CURSO
}

const plural = (cantidad, singular, varios) => (cantidad === 1 ? singular : varios)

// Nombres entre comillas unidos como en español: «A», «B» y «C».
export function listaDeNombres(nombres) {
  const citados = nombres.map((nombre) => `«${nombre}»`)
  return citados.length < 2 ? citados.join('') : `${citados.slice(0, -1).join(', ')} y ${citados.at(-1)}`
}

const pisosSeguros = (hasta) =>
  hasta === 1 ? 'El piso 1 es seguro.' : `Los pisos 1 a ${hasta} son seguros.`

const pisosDeRotura = (desde, totalPisos) =>
  desde === totalPisos ? `El piso ${desde} es de rotura.` : `Los pisos ${desde} a ${totalPisos} son de rotura.`

export function describirLanzamiento(resultado, totalPisos) {
  switch (resultado.tipo) {
    case TIPO_LANZAMIENTO.REALIZADO:
      return describirLanzamientoRealizado(resultado, totalPisos)
    case TIPO_LANZAMIENTO.PISO_INVALIDO:
      return { tono: TONO.ERROR, texto: `Piso no válido: elige un número entero entre 1 y ${totalPisos}.` }
    case TIPO_LANZAMIENTO.SIN_HUEVOS:
      return {
        tono: TONO.AVISO,
        texto: resultado.hayCerteza
          ? 'No quedan huevos, así que ya no se permiten lanzamientos. La evidencia determina F: pulsa «Declarar».'
          : 'No quedan huevos, así que ya no se permiten lanzamientos.',
      }
    case TIPO_LANZAMIENTO.REDUNDANTE: {
      const conocido =
        resultado.estadoPiso === ESTADO_PISO.SEGURO
          ? 'es seguro (el huevo sobreviviría)'
          : 'es de rotura (el huevo se rompería)'
      return {
        tono: TONO.AVISO,
        texto: `Intento redundante: ya se sabe que el piso ${resultado.piso} ${conocido}. No se contó el intento ni se usó un huevo.`,
      }
    }
    default:
      return MENSAJE_PARTIDA_TERMINADA
  }
}

function describirLanzamientoRealizado(resultado, totalPisos) {
  const { lanzamiento, huevosDisponibles, hayCerteza, candidatos, estadoPartida, pisoCritico } = resultado
  const { numero, piso } = lanzamiento
  const seRompio = lanzamiento.resultado === RESULTADO.SE_ROMPE

  const partes = [`Intento ${numero}: el huevo ${seRompio ? 'se rompió' : 'sobrevivió'} en el piso ${piso}.`]
  if (seRompio) {
    partes.push(pisosDeRotura(piso, totalPisos))
    partes.push(
      huevosDisponibles === 0
        ? 'No quedan huevos.'
        : `Te ${plural(huevosDisponibles, 'queda', 'quedan')} ${huevosDisponibles} ${plural(huevosDisponibles, 'huevo', 'huevos')}.`,
    )
  } else {
    partes.push(pisosSeguros(piso))
  }

  if (estadoPartida === ESTADO_PARTIDA.NO_RESUELTA) {
    partes.push(
      `La evidencia no basta para determinar F (podía estar entre los pisos ${candidatos.desde} y ${candidatos.hasta}). Partida no resuelta: el piso crítico era ${pisoCritico}.`,
    )
    return { tono: TONO.ERROR, texto: partes.join(' ') }
  }
  if (hayCerteza) {
    partes.push('La evidencia ya determina un único piso crítico: pulsa «Declarar».')
  }
  return { tono: seRompio ? TONO.ROTURA : TONO.SEGURO, texto: partes.join(' ') }
}

export function describirDeclaracion(resultado, totalPisos) {
  switch (resultado.tipo) {
    case TIPO_DECLARACION.CORRECTA:
      return { tono: TONO.EXITO, texto: explicarAcierto(resultado, totalPisos) }
    case TIPO_DECLARACION.INCORRECTA:
      return { tono: TONO.ERROR, texto: explicarError(resultado) }
    case TIPO_DECLARACION.SIN_EVIDENCIA: {
      const { desde, hasta } = resultado.evidencia
      return {
        tono: TONO.AVISO,
        texto: `Aún no hay evidencia suficiente: con tus lanzamientos, F puede ser cualquier piso entre ${desde} y ${hasta}. Sigue lanzando para reducir los candidatos.`,
      }
    }
    case TIPO_DECLARACION.PISO_INVALIDO:
      return { tono: TONO.ERROR, texto: `Escribe un piso entero entre 1 y ${totalPisos}.` }
    default:
      return MENSAJE_PARTIDA_TERMINADA
  }
}

function explicarAcierto({ piso, evidencia, intentos }, totalPisos) {
  const { maxSeguro, minRotura } = evidencia
  let motivo
  if (minRotura === null) {
    motivo = `el huevo sobrevivió en el piso ${maxSeguro} y F no puede ser mayor que ${totalPisos}`
  } else if (maxSeguro === 0) {
    motivo = `el huevo se rompió en el piso ${minRotura}, así que no hay pisos seguros (el piso seguro máximo es 0)`
  } else {
    motivo = `el huevo sobrevivió en el piso ${maxSeguro} y se rompió en el piso ${minRotura}`
  }
  return `¡Correcto! El piso crítico es ${piso}: ${motivo}. Lo demostraste en ${intentos} ${plural(intentos, 'intento', 'intentos')}.`
}

function explicarError({ piso, evidencia, huevosDisponibles }) {
  const { maxSeguro, minRotura } = evidencia
  const motivo =
    piso <= maxSeguro
      ? `el huevo sobrevivió en el piso ${maxSeguro}, así que el piso ${piso} es seguro y no puede ser F`
      : `el huevo se rompió en el piso ${minRotura}, así que F no puede ser mayor que ${minRotura}`
  const siguiente = huevosDisponibles > 0 ? 'Puedes seguir buscando.' : 'Revisa la torre y vuelve a declarar.'
  return `Declaración incorrecta: ${motivo}. ${siguiente}`
}

// CU-05: resultado de ejecutar una estrategia. `ejecucion` tiene la forma descrita en PantallaEstrategias.
export function describirEjecucion({ estrategia, lanzamientos, resuelta, pisoIdentificado, huevosRotos }) {
  const nombre = nombreEstrategia(estrategia)
  const total = `${lanzamientos.length} ${plural(lanzamientos.length, 'lanzamiento', 'lanzamientos')}`
  if (!resuelta) {
    return {
      tono: TONO.ERROR,
      texto: `Búsqueda no resuelta: «${nombre}» se quedó sin huevos sin poder determinar F. El historial conserva ${total}.`,
    }
  }
  return {
    tono: TONO.EXITO,
    texto: `«${nombre}» identificó el piso crítico ${pisoIdentificado} en ${total}, con ${huevosRotos} ${plural(huevosRotos, 'huevo roto', 'huevos rotos')}.`,
  }
}
