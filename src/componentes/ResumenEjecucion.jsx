import { HUEVOS_INICIALES } from '../dominio/constantes.js'
import { nombreEstrategia } from './opciones.js'

// RF-16 (CU-08): resumen al terminar una ejecución. Usa los mismos datos que el historial, así que coinciden.
export function ResumenEjecucion({ ejecucion }) {
  return (
    <section className="panel" aria-labelledby="titulo-resumen">
      <h2 id="titulo-resumen">Resumen</h2>
      {ejecucion === null ? (
        <p className="nota resumen__vacio">El resumen aparecerá al terminar una ejecución.</p>
      ) : (
        <dl className="estado resumen">
          <div className="estado__fila">
            <dt>Estrategia</dt>
            <dd>{nombreEstrategia(ejecucion.estrategia)}</dd>
          </div>
          <div className="estado__fila">
            <dt>Piso crítico identificado</dt>
            <dd>{ejecucion.resuelta ? ejecucion.pisoIdentificado : 'No identificado'}</dd>
          </div>
          <div className="estado__fila">
            <dt>Lanzamientos realizados</dt>
            <dd>{ejecucion.lanzamientos.length}</dd>
          </div>
          <div className="estado__fila">
            <dt>Huevos rotos</dt>
            <dd>
              {ejecucion.huevosRotos} de {HUEVOS_INICIALES}
            </dd>
          </div>
          <div className="estado__fila">
            <dt>Resultado</dt>
            <dd>{ejecucion.resuelta ? 'Resuelta' : 'No resuelta'}</dd>
          </div>
        </dl>
      )}
    </section>
  )
}
