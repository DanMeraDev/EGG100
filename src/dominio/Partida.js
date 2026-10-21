import { ControlHuevos } from './ControlHuevos.js'
import { Edificio } from './Edificio.js'
import { generarPisoCriticoAleatorio } from './generarPisoCritico.js'
import { Historial } from './Historial.js'
import { determinarResultado, RESULTADO } from './Lanzamiento.js'
import { RegistroInferencias } from './RegistroInferencias.js'

export const ESTADO_PARTIDA = Object.freeze({
  SIN_INICIAR: 'sin_iniciar',
  EN_CURSO: 'en_curso',
  RESUELTA: 'resuelta',
  NO_RESUELTA: 'no_resuelta',
})

export const TIPO_LANZAMIENTO = Object.freeze({
  REALIZADO: 'realizado',
  PISO_INVALIDO: 'piso_invalido',
  SIN_HUEVOS: 'sin_huevos',
  REDUNDANTE: 'redundante',
  PARTIDA_INACTIVA: 'partida_inactiva',
})

export const TIPO_DECLARACION = Object.freeze({
  CORRECTA: 'correcta',
  INCORRECTA: 'incorrecta',
  SIN_EVIDENCIA: 'sin_evidencia',
  PISO_INVALIDO: 'piso_invalido',
  PARTIDA_INACTIVA: 'partida_inactiva',
})

// Partida manual del prototipo V1 (CU-01, CU-02, CU-09, CU-10, CU-11).
export class Partida {
  #edificio
  #generarPisoCritico
  #estado = ESTADO_PARTIDA.SIN_INICIAR
  #pisoCritico = null
  #huevos
  #historial
  #inferencias

  constructor({ edificio = new Edificio(), generarPisoCritico = generarPisoCriticoAleatorio } = {}) {
    this.#edificio = edificio
    this.#generarPisoCritico = generarPisoCritico
    this.#restablecerRecursos()
  }

  get estado() {
    return this.#estado
  }

  get enCurso() {
    return this.#estado === ESTADO_PARTIDA.EN_CURSO
  }

  get finalizada() {
    return this.#estado === ESTADO_PARTIDA.RESUELTA || this.#estado === ESTADO_PARTIDA.NO_RESUELTA
  }

  get edificio() {
    return this.#edificio
  }

  get huevosIniciales() {
    return this.#huevos.iniciales
  }

  get huevosDisponibles() {
    return this.#huevos.disponibles
  }

  // RF-05: el contador sale del historial, así ambos no pueden divergir.
  get intentos() {
    return this.#historial.total
  }

  get historial() {
    return this.#historial.lanzamientos
  }

  get candidatos() {
    return this.#inferencias.candidatos
  }

  get hayCerteza() {
    return this.#inferencias.pisoDeterminado !== null
  }

  // F se mantiene oculto mientras la partida está en curso (RF-17, RF-19).
  get pisoCriticoRevelado() {
    return this.finalizada ? this.#pisoCritico : null
  }

  // RN-12: solo una partida en curso exige confirmación para reiniciar.
  get requiereConfirmacionParaReiniciar() {
    return this.enCurso
  }

  estadoDePiso(piso) {
    return this.#inferencias.estadoDe(piso)
  }

  iniciar() {
    const pisoCritico = this.#generarPisoCritico(this.#edificio.totalPisos)
    if (!this.#edificio.esPisoValido(pisoCritico)) {
      throw new RangeError(`Piso crítico fuera del edificio: ${pisoCritico}`)
    }
    this.#pisoCritico = pisoCritico
    this.#restablecerRecursos()
    this.#estado = ESTADO_PARTIDA.EN_CURSO
  }

  reiniciar({ confirmado = false } = {}) {
    if (this.requiereConfirmacionParaReiniciar && !confirmado) {
      return { reiniciada: false, requiereConfirmacion: true }
    }
    this.iniciar()
    return { reiniciada: true, requiereConfirmacion: false }
  }

  // Valida en el orden del diagrama D3: rango, huevos disponibles y redundancia.
  lanzar(valorPiso) {
    if (!this.enCurso) {
      return { tipo: TIPO_LANZAMIENTO.PARTIDA_INACTIVA, estadoPartida: this.#estado }
    }
    const piso = this.#edificio.interpretarPiso(valorPiso)
    if (piso === null) {
      return { tipo: TIPO_LANZAMIENTO.PISO_INVALIDO, valor: valorPiso }
    }
    if (!this.#huevos.hayDisponibles) {
      return { tipo: TIPO_LANZAMIENTO.SIN_HUEVOS, hayCerteza: this.hayCerteza }
    }
    if (this.#inferencias.esRedundante(piso)) {
      return { tipo: TIPO_LANZAMIENTO.REDUNDANTE, piso, estadoPiso: this.#inferencias.estadoDe(piso) }
    }

    const resultado = determinarResultado(piso, this.#pisoCritico)
    if (resultado === RESULTADO.SE_ROMPE) {
      this.#huevos.romper()
    }
    this.#inferencias.registrar(piso, resultado)
    const lanzamiento = this.#historial.registrar(piso, resultado)

    // RN-11: sin huevos y sin certeza, la partida termina como no resuelta.
    if (!this.#huevos.hayDisponibles && !this.hayCerteza) {
      this.#estado = ESTADO_PARTIDA.NO_RESUELTA
    }

    return {
      tipo: TIPO_LANZAMIENTO.REALIZADO,
      lanzamiento,
      huevosDisponibles: this.huevosDisponibles,
      hayCerteza: this.hayCerteza,
      candidatos: this.candidatos,
      estadoPartida: this.#estado,
      pisoCritico: this.pisoCriticoRevelado,
    }
  }

  declarar(valorPiso) {
    if (!this.enCurso) {
      return { tipo: TIPO_DECLARACION.PARTIDA_INACTIVA, estadoPartida: this.#estado }
    }
    const piso = this.#edificio.interpretarPiso(valorPiso)
    if (piso === null) {
      return { tipo: TIPO_DECLARACION.PISO_INVALIDO, valor: valorPiso }
    }

    const { desde, hasta } = this.#inferencias.candidatos
    const datos = {
      piso,
      evidencia: {
        maxSeguro: this.#inferencias.maxSeguro,
        minRotura: this.#inferencias.minRotura,
        desde,
        hasta,
      },
      intentos: this.intentos,
      huevosDisponibles: this.huevosDisponibles,
    }
    const compatible = piso >= desde && piso <= hasta

    // La falta de evidencia se evalúa antes que la coincidencia con F para que declarar al azar no revele F.
    if (compatible && desde !== hasta) {
      return { tipo: TIPO_DECLARACION.SIN_EVIDENCIA, ...datos }
    }
    if (compatible && piso === this.#pisoCritico) {
      this.#estado = ESTADO_PARTIDA.RESUELTA
      return { tipo: TIPO_DECLARACION.CORRECTA, ...datos }
    }
    return { tipo: TIPO_DECLARACION.INCORRECTA, ...datos }
  }

  // Vista inmutable para la interfaz; no incluye F mientras la partida sigue en curso.
  instantanea() {
    return Object.freeze({
      estado: this.#estado,
      totalPisos: this.#edificio.totalPisos,
      huevosIniciales: this.huevosIniciales,
      huevosDisponibles: this.huevosDisponibles,
      intentos: this.intentos,
      historial: this.historial,
      pisos: this.#edificio.pisos.map((numero) => ({
        numero,
        estado: this.#inferencias.estadoDe(numero),
      })),
      candidatos: this.candidatos,
      hayCerteza: this.hayCerteza,
      pisoCriticoRevelado: this.pisoCriticoRevelado,
    })
  }

  #restablecerRecursos() {
    this.#huevos = new ControlHuevos()
    this.#historial = new Historial()
    this.#inferencias = new RegistroInferencias(this.#edificio.totalPisos)
  }
}
