import { RESULTADO } from '../dominio/Lanzamiento.js'
import { CampoPiso } from './CampoPiso.jsx'
import { ETIQUETA_RESULTADO } from './etiquetas.js'

// El huevo 1 se usa hasta que se rompe y el huevo 2 después: así se distinguen los saltos decrecientes
// de la búsqueda uno a uno.
function separarPorHuevo(lanzamientos) {
  const rotura = lanzamientos.findIndex(({ resultado }) => resultado === RESULTADO.SE_ROMPE)
  const corte = rotura === -1 ? lanzamientos.length : rotura + 1
  return [
    { titulo: 'Huevo 1', lanzamientos: lanzamientos.slice(0, corte) },
    { titulo: 'Huevo 2', lanzamientos: lanzamientos.slice(corte) },
  ].filter((grupo) => grupo.lanzamientos.length > 0)
}

// RF-12 (CU-07): orden de los pisos que examina la estrategia óptima y el resultado de cada lanzamiento.
export function SecuenciaOptima({ pisoCritico, errorPiso, secuencia, onCambiarPiso, onVerSecuencia }) {
  const enviar = (evento) => {
    evento.preventDefault()
    onVerSecuencia()
  }

  return (
    <section className="panel" aria-labelledby="titulo-secuencia">
      <h2 id="titulo-secuencia">Secuencia óptima</h2>
      <form className="controles" noValidate onSubmit={enviar}>
        <CampoPiso
          id="piso-critico-secuencia"
          etiqueta="Piso crítico (F)"
          valor={pisoCritico}
          error={errorPiso}
          onCambiar={onCambiarPiso}
        />
        <button type="submit" className="boton boton--primario">
          Ver secuencia
        </button>
      </form>
      {secuencia === null ? (
        <p className="nota">Indica un piso crítico y pulsa «Ver secuencia» para ver el orden de lanzamientos.</p>
      ) : (
        <div className="secuencia">
          <p className="secuencia__titulo">Orden de lanzamientos con F = {secuencia.pisoCritico}</p>
          {separarPorHuevo(secuencia.lanzamientos).map(({ titulo, lanzamientos }) => (
            <div key={titulo} className="secuencia__grupo">
              <h3>{titulo}</h3>
              <ol className="secuencia__pasos">
                {lanzamientos.map(({ numero, piso, resultado }, indice) => (
                  <li
                    key={numero}
                    aria-label={`Lanzamiento ${numero}: piso ${piso}, ${ETIQUETA_RESULTADO[resultado].toLowerCase()}`}
                  >
                    {indice > 0 && (
                      <span className="secuencia__flecha" aria-hidden="true">
                        →
                      </span>
                    )}
                    <span className="paso" data-resultado={resultado}>
                      <small>#{numero}</small>
                      <strong>{piso}</strong>
                      <span>{ETIQUETA_RESULTADO[resultado]}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
