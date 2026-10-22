import { TOTAL_PISOS } from '../dominio/constantes.js'
import { listaDeNombres } from './mensajes.js'
import { ESTRATEGIA, ESTRATEGIAS } from './opciones.js'

const MENSAJE_SIN_ANALISIS = 'Pulsa «Analizar los 100 escenarios» para calcular el peor caso de cada estrategia.'

function textoConclusion(filas, faltan, destacadas) {
  if (faltan.length > 0) {
    return `Análisis incompleto: falta el resultado de ${listaDeNombres(faltan.map(({ nombre }) => nombre))}, así que no se puede identificar el menor peor caso.`
  }
  const mejores = filas.filter(({ id }) => destacadas.includes(id))
  if (mejores.length === 1) {
    return `«${mejores[0].nombre}» tiene el menor peor caso: ${mejores[0].peorCaso} lanzamientos.`
  }
  if (mejores.length > 1) {
    return `${listaDeNombres(mejores.map(({ nombre }) => nombre))} empatan con el menor peor caso: ${mejores[0].peorCaso} lanzamientos.`
  }
  return null
}

// RF-13 y RF-14 (CU-08): máximo de lanzamientos de cada estrategia con los 100 pisos críticos y el menor peor caso.
export function AnalisisPeorCaso({ analisis, onAnalizar }) {
  const filas = ESTRATEGIAS.map(({ id, nombre }) => ({ id, nombre, peorCaso: analisis?.peorCaso[id] ?? null }))
  const faltan = analisis ? filas.filter(({ peorCaso }) => peorCaso === null) : []
  // Con resultados incompletos no se destaca ninguna estrategia (CU-08, flujo alternativo).
  const destacadas = analisis && faltan.length === 0 ? analisis.menorPeorCaso : []
  const conclusion = analisis ? textoConclusion(filas, faltan, destacadas) : MENSAJE_SIN_ANALISIS
  const peorCasoOptima = filas.find(({ id }) => id === ESTRATEGIA.OPTIMA).peorCaso

  return (
    <section className="panel" aria-labelledby="titulo-analisis">
      <h2 id="titulo-analisis">Análisis de 100 escenarios</h2>
      <p className="panel__subtitulo">Pisos críticos del 1 al {TOTAL_PISOS}</p>
      <button type="button" className="boton boton--primario boton--ancho" onClick={onAnalizar}>
        Analizar los 100 escenarios
      </button>
      <ul className="peor-caso">
        {filas.map(({ id, nombre, peorCaso }) => {
          const destacada = destacadas.includes(id)
          return (
            <li key={id} data-destacada={destacada ? 'true' : undefined}>
              <div className="peor-caso__encabezado">
                <span>{nombre}</span>
                {destacada && <span className="insignia">Menor peor caso</span>}
              </div>
              {peorCaso === null ? (
                <span className="comparacion__pendiente">Sin analizar</span>
              ) : (
                <div className="peor-caso__dato">
                  <span className="peor-caso__valor">{peorCaso} lanzamientos</span>
                  <span className="peor-caso__barra" aria-hidden="true">
                    <span style={{ width: `${(Math.min(peorCaso, TOTAL_PISOS) / TOTAL_PISOS) * 100}%` }} />
                  </span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {conclusion && (
        <p className="comparacion__conclusion" data-testid="conclusion-peor-caso">
          {conclusion}
        </p>
      )}
      {analisis?.optimaValida === false && (
        <p className="mensaje mensaje--error" role="alert">
          Fallo de validación: la estrategia óptima necesitó {peorCasoOptima} lanzamientos en algún escenario, más que
          el límite de 14. No se considera aprobada.
        </p>
      )}
      <p className="nota">
        El peor caso es el máximo de lanzamientos entre los 100 pisos críticos posibles. Una partida concreta puede
        necesitar menos.
      </p>
    </section>
  )
}
