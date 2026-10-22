import { useMemo, useState } from 'react'
import { TOTAL_PISOS } from '../dominio/constantes.js'
import { Edificio } from '../dominio/Edificio.js'
import { Partida } from '../dominio/Partida.js'
import { ESTADO_PISO } from '../dominio/RegistroInferencias.js'
import { ejecutarEstrategia } from '../dominio/estrategias/Ejecutor.js'
import { obtenerEstrategia } from '../dominio/estrategias/RegistroEstrategias.js'
import { ComparacionEstrategias } from './ComparacionEstrategias.jsx'
import { ControlesEstrategia } from './ControlesEstrategia.jsx'
import { Leyenda } from './Leyenda.jsx'
import { MensajeEstado } from './MensajeEstado.jsx'
import { describirEjecucion, MENSAJE_INICIAL_ESTRATEGIAS } from './mensajes.js'
import { ESTRATEGIA, ESTRATEGIAS, estaRegistrada, nombreEstrategia } from './opciones.js'
import { ResumenEjecucion } from './ResumenEjecucion.jsx'
import { TablaHistorial } from './TablaHistorial.jsx'
import { TorreEdificio } from './TorreEdificio.jsx'

const PISOS_SIN_INFORMACION = Array.from({ length: TOTAL_PISOS }, (_, indice) => ({
  numero: indice + 1,
  estado: ESTADO_PISO.DESCONOCIDO,
}))
const ESTRATEGIAS_COMPARABLES = ESTRATEGIAS.filter(({ disponible }) => disponible)
const EDIFICIO = new Edificio()
const sinAccion = () => {}

// Pantalla «Ejecución de estrategias» de los prototipos V2 y V3 (RF-07, RF-08, RF-09, RF-10, RF-16, RF-21).
export function PantallaEstrategias() {
  const [estrategia, setEstrategia] = useState(ESTRATEGIA.SECUENCIAL)
  const [pisoCritico, setPisoCritico] = useState('')
  const [ejecucion, setEjecucion] = useState(null)
  const [comparacion, setComparacion] = useState({ pisoCritico: null, lanzamientos: {}, menosLanzamientos: [] })
  const [errorPiso, setErrorPiso] = useState(null)

  const cambiarPiso = (nuevoPiso) => {
    setPisoCritico(nuevoPiso)
    setErrorPiso(null)
    const f = EDIFICIO.interpretarPiso(nuevoPiso)
    if (comparacion.pisoCritico !== null && f !== comparacion.pisoCritico) {
      setComparacion({ pisoCritico: null, lanzamientos: {}, menosLanzamientos: [] })
    }
  }

  const ejecutar = () => {
    const piso = EDIFICIO.interpretarPiso(pisoCritico)
    if (piso === null) {
      setErrorPiso('Piso crítico no válido: elige un número entero entre 1 y 100.')
      return
    }
    setErrorPiso(null)

    if (!estaRegistrada(estrategia)) {
      return
    }

    const partida = new Partida({ edificio: EDIFICIO })
    partida.iniciar({ pisoCritico: piso })
    const fnEstrategia = obtenerEstrategia(estrategia)
    const resultado = ejecutarEstrategia(partida, fnEstrategia)

    const nuevaEjecucion = {
      estrategia,
      pisoCritico: piso,
      lanzamientos: resultado.lanzamientos,
      pisos: resultado.pisos,
      resuelta: resultado.resuelta,
      pisoIdentificado: resultado.pisoIdentificado,
      huevosRotos: resultado.huevosRotos,
    }
    setEjecucion(nuevaEjecucion)

    const lanzamientosActuales =
      comparacion.pisoCritico === piso ? { ...comparacion.lanzamientos } : {}
    lanzamientosActuales[estrategia] = resultado.lanzamientos.length

    const comparables = ESTRATEGIAS_COMPARABLES.map(({ id }) => id)
    const faltan = comparables.filter((id) => lanzamientosActuales[id] === undefined)
    let menosLanzamientos = []
    if (faltan.length === 0) {
      const min = Math.min(...comparables.map((id) => lanzamientosActuales[id]))
      menosLanzamientos = comparables.filter((id) => lanzamientosActuales[id] === min)
    }

    setComparacion({
      pisoCritico: piso,
      lanzamientos: lanzamientosActuales,
      menosLanzamientos,
    })
  }

  const reiniciar = () => {
    setEstrategia(ESTRATEGIA.SECUENCIAL)
    setPisoCritico('')
    setErrorPiso(null)
    setEjecucion(null)
    setComparacion({ pisoCritico: null, lanzamientos: {}, menosLanzamientos: [] })
  }

  const resultadosComparacion = useMemo(
    () =>
      ESTRATEGIAS_COMPARABLES.map(({ id, nombre }) => ({
        id,
        nombre,
        lanzamientos: comparacion.lanzamientos[id] ?? null,
      })),
    [comparacion],
  )

  return (
    <main className="simulacion">
      {/* RF-08: la torre colorea los pisos según los lanzamientos de la estrategia; aquí no se pueden pulsar. */}
      <TorreEdificio
        pisos={ejecucion?.pisos ?? PISOS_SIN_INFORMACION}
        pisoSeleccionado={null}
        deshabilitada
        onSeleccionar={sinAccion}
      />

      <div className="columna">
        <section className="panel" aria-labelledby="titulo-estrategia">
          <h2 id="titulo-estrategia">Estrategia y simulación</h2>
          <ControlesEstrategia
            estrategia={estrategia}
            pisoCritico={pisoCritico}
            errorPiso={errorPiso}
            onCambiarEstrategia={setEstrategia}
            onCambiarPiso={cambiarPiso}
            onEjecutar={ejecutar}
            onReiniciar={reiniciar}
          />
          {/* CU-05: piso crítico identificado o búsqueda no resuelta. */}
          <MensajeEstado mensaje={ejecucion ? describirEjecucion(ejecucion) : MENSAJE_INICIAL_ESTRATEGIAS} />
        </section>
        <ResumenEjecucion ejecucion={ejecucion} />
      </div>

      <div className="columna">
        <TablaHistorial
          lanzamientos={ejecucion?.lanzamientos ?? []}
          subtitulo={ejecucion ? `${nombreEstrategia(ejecucion.estrategia)} · F = ${ejecucion.pisoCritico}` : null}
        />
        <ComparacionEstrategias
          pisoCritico={comparacion.pisoCritico}
          resultados={resultadosComparacion}
          menosLanzamientos={comparacion.menosLanzamientos}
        />
        <Leyenda />
      </div>
    </main>
  )
}
