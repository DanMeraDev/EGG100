import { EMPATE } from './opciones.js'

function textoConclusion(resultados, faltan, menosLanzamientos) {
  if (faltan.length > 0) {
    const nombres = faltan.map(({ nombre }) => `«${nombre}»`).join(' y ')
    return `Falta ejecutar ${nombres} con este piso crítico para poder comparar.`
  }
  if (menosLanzamientos === EMPATE) {
    return `Empate: las dos estrategias usaron ${resultados[0].lanzamientos} lanzamientos.`
  }
  const mejor = resultados.find(({ id }) => id === menosLanzamientos)
  return mejor ? `«${mejor.nombre}» usó menos lanzamientos con este piso crítico.` : null
}

// RF-10 (CU-06): lanzamientos de cada estrategia con el mismo F. Es un resultado puntual, no el peor caso (V3).
export function ComparacionEstrategias({ pisoCritico, resultados, menosLanzamientos }) {
  const faltan = resultados.filter(({ lanzamientos }) => lanzamientos === null)
  // Con resultados incompletos no se destaca ninguna estrategia (CU-06, flujo alternativo).
  const destacada = faltan.length === 0 ? menosLanzamientos : null
  const conclusion = textoConclusion(resultados, faltan, menosLanzamientos)

  return (
    <section className="panel" aria-labelledby="titulo-comparacion">
      <h2 id="titulo-comparacion">Comparación</h2>
      <p className="panel__subtitulo">
        {pisoCritico === null ? 'Mismo piso crítico para las dos estrategias' : `Piso crítico F = ${pisoCritico}`}
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
            {resultados.map(({ id, nombre, lanzamientos }) => (
              <tr key={id} data-destacada={id === destacada ? 'true' : undefined}>
                <th scope="row">{nombre}</th>
                <td>
                  <div className="comparacion__celda">
                    {lanzamientos ?? <span className="comparacion__pendiente">Sin ejecutar</span>}
                    {id === destacada && <span className="insignia">Menos lanzamientos</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {conclusion && (
        <p className="comparacion__conclusion" data-testid="conclusion-comparacion">
          {conclusion}
        </p>
      )}
      <p className="nota">
        Compara una sola ejecución con este piso crítico; no es el peor caso de cada estrategia, que se analizará en
        V3.
      </p>
    </section>
  )
}
