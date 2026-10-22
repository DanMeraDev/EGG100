import { useState } from 'react'
import { TOTAL_PISOS } from '../dominio/constantes.js'
import { ESTADO_PISO } from '../dominio/RegistroInferencias.js'
import { ComparacionEstrategias } from './ComparacionEstrategias.jsx'
import { ControlesEstrategia } from './ControlesEstrategia.jsx'
import { Leyenda } from './Leyenda.jsx'
import { MensajeEstado } from './MensajeEstado.jsx'
import { describirEjecucion, MENSAJE_INICIAL_ESTRATEGIAS } from './mensajes.js'
import { ESTRATEGIA, ESTRATEGIAS, nombreEstrategia } from './opciones.js'
import { TablaHistorial } from './TablaHistorial.jsx'
import { TorreEdificio } from './TorreEdificio.jsx'

const PISOS_SIN_INFORMACION = Array.from({ length: TOTAL_PISOS }, (_, indice) => ({
  numero: indice + 1,
  estado: ESTADO_PISO.DESCONOCIDO,
}))
const ESTRATEGIAS_COMPARABLES = ESTRATEGIAS.filter(({ disponible }) => disponible)
const sinAccion = () => {}

// Pantalla «Ejecución de estrategia» del prototipo V2. Solo interfaz: los comentarios «LÓGICA» indican
// qué debe aportar la lógica en cada punto; mientras tanto se muestran los estados iniciales.
export function PantallaEstrategias() {
  const [estrategia, setEstrategia] = useState(ESTRATEGIA.SECUENCIAL)
  const [pisoCritico, setPisoCritico] = useState('')

  // LÓGICA (RF-08, RF-09, RF-21): resultado de la última ejecución, o null si todavía no hay ninguna.
  // Forma esperada:
  //   {
  //     estrategia,        // id de ESTRATEGIA que se ejecutó
  //     pisoCritico,       // F usado en la ejecución
  //     lanzamientos,      // [{ numero, piso, resultado }] en orden, sin omisiones ni duplicados (RF-09)
  //     pisos,             // [{ numero, estado }] para colorear la torre igual que en V1
  //     resuelta,          // false si se agotaron los huevos sin determinar F (CU-05)
  //     pisoIdentificado,  // F encontrado por la estrategia
  //     huevosRotos,       // 0, 1 o 2
  //   }
  const ejecucion = null

  // LÓGICA (RF-10): lanzamientos de la última ejecución de cada estrategia con el mismo F (null si falta
  // ejecutarla) y cuál usó menos: el id de la estrategia, EMPATE o null. Si el usuario cambia F, los
  // resultados anteriores dejan de ser comparables y deben descartarse.
  const comparacion = { pisoCritico: null, lanzamientos: {}, menosLanzamientos: null }

  // LÓGICA (RF-06): mensaje de error si `pisoCritico` no es un entero entre 1 y 100; null si es válido.
  const errorPiso = null

  const ejecutar = () => {
    // LÓGICA (RF-06, RF-07, RF-08, RF-21): validar `pisoCritico` (Edificio.interpretarPiso). Si es válido,
    // ejecutar la estrategia `estrategia` con ese F y las mismas reglas de V1 (2 huevos; se rompe si
    // piso ≥ F), guardar el resultado en `ejecucion` y actualizar `comparacion`.
  }

  const reiniciar = () => {
    setEstrategia(ESTRATEGIA.SECUENCIAL)
    setPisoCritico('')
    // LÓGICA: descartar también `ejecucion` y `comparacion`.
  }

  const resultadosComparacion = ESTRATEGIAS_COMPARABLES.map(({ id, nombre }) => ({
    id,
    nombre,
    lanzamientos: comparacion.lanzamientos[id] ?? null,
  }))

  return (
    <main className="simulacion">
      {/* RF-08: la torre colorea los pisos según los lanzamientos de la estrategia; aquí no se pueden pulsar. */}
      <TorreEdificio
        pisos={ejecucion?.pisos ?? PISOS_SIN_INFORMACION}
        pisoSeleccionado={null}
        deshabilitada
        onSeleccionar={sinAccion}
      />

      <section className="panel" aria-labelledby="titulo-estrategia">
        <h2 id="titulo-estrategia">Estrategia y simulación</h2>
        <ControlesEstrategia
          estrategia={estrategia}
          pisoCritico={pisoCritico}
          errorPiso={errorPiso}
          onCambiarEstrategia={setEstrategia}
          onCambiarPiso={setPisoCritico}
          onEjecutar={ejecutar}
          onReiniciar={reiniciar}
        />
        {/* CU-05: piso crítico identificado o búsqueda no resuelta. */}
        <MensajeEstado mensaje={ejecucion ? describirEjecucion(ejecucion) : MENSAJE_INICIAL_ESTRATEGIAS} />
      </section>

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
