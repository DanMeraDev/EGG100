import { useState } from 'react'
import { ESTADO_PARTIDA, TIPO_DECLARACION } from '../dominio/Partida.js'
import { ControlesLanzamiento } from './ControlesLanzamiento.jsx'
import { DialogoConfirmacion } from './DialogoConfirmacion.jsx'
import { DialogoDeclarar } from './DialogoDeclarar.jsx'
import { Instrucciones } from './Instrucciones.jsx'
import { Leyenda } from './Leyenda.jsx'
import { MensajeEstado } from './MensajeEstado.jsx'
import {
  describirDeclaracion,
  describirLanzamiento,
  MENSAJE_INICIAL,
  MENSAJE_REINICIO,
  MENSAJE_REINICIO_CANCELADO,
} from './mensajes.js'
import { PanelEstado } from './PanelEstado.jsx'
import { TablaHistorial } from './TablaHistorial.jsx'
import { TorreEdificio } from './TorreEdificio.jsx'

const DIALOGO = Object.freeze({ DECLARAR: 'declarar', REINICIAR: 'reiniciar' })

// Pantalla de simulación del prototipo V1 (wireframe "Lanzamiento Manual").
export function PantallaSimulacion({ partida, lanzar, declarar, reiniciar }) {
  const [pisoSeleccionado, setPisoSeleccionado] = useState('')
  const [mensaje, setMensaje] = useState(MENSAJE_INICIAL)
  const [dialogo, setDialogo] = useState(null)

  const enCurso = partida.estado === ESTADO_PARTIDA.EN_CURSO
  const cerrarDialogo = () => setDialogo(null)

  const empezarDeNuevo = () => {
    setPisoSeleccionado('')
    setMensaje(MENSAJE_REINICIO)
  }

  const manejarLanzar = () => {
    setMensaje(describirLanzamiento(lanzar(pisoSeleccionado), partida.totalPisos))
  }

  // Devuelve el error para mostrarlo dentro del diálogo; cualquier otro resultado lo cierra.
  const manejarDeclarar = (valor) => {
    const resultado = declarar(valor)
    const descripcion = describirDeclaracion(resultado, partida.totalPisos)
    if (resultado.tipo === TIPO_DECLARACION.PISO_INVALIDO) {
      return descripcion.texto
    }
    cerrarDialogo()
    setMensaje(descripcion)
    return null
  }

  const manejarReiniciar = () => {
    const { requiereConfirmacion } = reiniciar()
    if (requiereConfirmacion) {
      setDialogo(DIALOGO.REINICIAR)
    } else {
      empezarDeNuevo()
    }
  }

  const confirmarReinicio = () => {
    reiniciar({ confirmado: true })
    cerrarDialogo()
    empezarDeNuevo()
  }

  const cancelarReinicio = () => {
    cerrarDialogo()
    setMensaje(MENSAJE_REINICIO_CANCELADO)
  }

  return (
    <>
      <details className="ayuda">
        <summary>¿Cómo jugar?</summary>
        <Instrucciones />
      </details>

      <main className="simulacion">
        <TorreEdificio
          pisos={partida.pisos}
          pisoSeleccionado={Number(pisoSeleccionado)}
          deshabilitada={!enCurso}
          onSeleccionar={(piso) => setPisoSeleccionado(String(piso))}
        />

        <section className="panel" aria-labelledby="titulo-lanzamiento">
          <h2 id="titulo-lanzamiento">Estado y lanzamiento</h2>
          <PanelEstado
            huevosIniciales={partida.huevosIniciales}
            huevosDisponibles={partida.huevosDisponibles}
            intentos={partida.intentos}
            estado={partida.estado}
            pisoCriticoRevelado={partida.pisoCriticoRevelado}
          />
          <ControlesLanzamiento
            piso={pisoSeleccionado}
            totalPisos={partida.totalPisos}
            enCurso={enCurso}
            puedeLanzar={enCurso && partida.huevosDisponibles > 0}
            sugerirDeclarar={enCurso && partida.hayCerteza}
            onCambiarPiso={setPisoSeleccionado}
            onLanzar={manejarLanzar}
            onDeclarar={() => setDialogo(DIALOGO.DECLARAR)}
            onReiniciar={manejarReiniciar}
          />
          <MensajeEstado mensaje={mensaje} />
        </section>

        <div className="columna">
          <Leyenda />
          <TablaHistorial lanzamientos={partida.historial} />
        </div>
      </main>

      {dialogo === DIALOGO.DECLARAR && (
        <DialogoDeclarar
          valorInicial={pisoSeleccionado}
          totalPisos={partida.totalPisos}
          onDeclarar={manejarDeclarar}
          onCancelar={cerrarDialogo}
        />
      )}

      {dialogo === DIALOGO.REINICIAR && (
        <DialogoConfirmacion
          titulo="¿Reiniciar la partida?"
          textoConfirmar="Sí, reiniciar"
          onConfirmar={confirmarReinicio}
          onCancelar={cancelarReinicio}
        >
          Se perderán los lanzamientos, el historial y las inferencias de esta partida, y se generará un nuevo piso
          crítico oculto.
        </DialogoConfirmacion>
      )}
    </>
  )
}
