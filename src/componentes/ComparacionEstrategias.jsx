import { listaDeNombres } from './mensajes.js'

function textoConclusion(resultados, faltan, destacadas) {
  if (faltan.length > 0) {
    return `Falta ejecutar ${listaDeNombres(faltan.map(({ nombre }) => nombre))} con este piso crítico para poder comparar.`
  }
  const mejores = resultados.filter(({ id }) => destacadas.includes(id))
  if (mejores.length === 1) {
    return `«${mejores[0].nombre}» usó menos lanzamientos con este piso crítico.`
  }
  if (mejores.length > 1) {
    return `${listaDeNombres(mejores.map(({ nombre }) => nombre))} empataron con ${mejores[0].lanzamientos} lanzamientos.`
  }
  return null
}

// RF-10 (CU-06): lanzamientos de cada estrategia con el mismo F. Es un resultado puntual, no el peor caso.
export function ComparacionEstrategias({ pisoCritico, resultados, menosLanzamientos }) {
  const faltan = resultados.filter(({ lanzamientos }) => lanzamientos === null)
  // Con resultados incompletos no se destaca ninguna estrategia (CU-06, flujo alternativo).
  const destacadas = faltan.length === 0 ? menosLanzamientos : []
  const conclusion = textoConclusion(resultados, faltan, destacadas)

  return (
    <section className="panel" aria-labelledby="titulo-comparacion">
      <h2 id="titulo-comparacion">Comparación</h2>
      <p className="panel__subtitulo">
        {pisoCritico === null ? 'Mismo piso crítico para todas las estrategias' : `Piso crítico F = ${pisoCritico}`}
      </p>
      <div className="tabla-contenedor">
        <table className="comparacion" aria-labelledby="titulo-comparacion">
          <thead>
            <tr>
              <th scope="col">Estrategia</th>
              <th scope="col">Lanzamientos</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map(({ id, nombre, lanzamientos }) => {
              const destacada = destacadas.includes(id)
              return (
                <tr key={id} data-destacada={destacada ? 'true' : undefined}>
                  <th scope="row">{nombre}</th>
                  <td>
                    <div className="comparacion__celda">
                      {lanzamientos ?? <span className="comparacion__pendiente">Sin ejecutar</span>}
                      {destacada && <span className="insignia">Menos lanzamientos</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {conclusion && (
        <p className="comparacion__conclusion" data-testid="conclusion-comparacion">
          {conclusion}
        </p>
      )}
      <p className="nota">
        Compara una sola ejecución con este piso crítico; no es el peor caso de cada estrategia, que se muestra en
        «Análisis y resultados».
      </p>
    </section>
  )
}
