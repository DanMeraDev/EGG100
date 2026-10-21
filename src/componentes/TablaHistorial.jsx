import { ETIQUETA_RESULTADO } from './etiquetas.js'

// RF-09: historial ordenado de lanzamientos. En V2 también muestra la ejecución de una estrategia (con subtítulo).
export function TablaHistorial({ lanzamientos, subtitulo = null }) {
  return (
    <section className="panel" aria-labelledby="titulo-historial">
      <h2 id="titulo-historial">Historial</h2>
      {subtitulo && <p className="panel__subtitulo">{subtitulo}</p>}
      <div className="historial">
        <table aria-labelledby="titulo-historial">
          <thead>
            <tr>
              <th scope="col">Intento</th>
              <th scope="col">Piso</th>
              <th scope="col">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {lanzamientos.length === 0 ? (
              <tr>
                <td colSpan={3} className="historial__vacio">
                  Aún no hay lanzamientos.
                </td>
              </tr>
            ) : (
              lanzamientos.map(({ numero, piso, resultado }) => (
                <tr key={numero} data-resultado={resultado}>
                  <td>{numero}</td>
                  <td>{piso}</td>
                  <td>{ETIQUETA_RESULTADO[resultado]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
