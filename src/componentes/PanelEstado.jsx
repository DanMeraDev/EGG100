import { ETIQUETA_ESTADO_PARTIDA } from './etiquetas.js'

// CU-02: huevos, intentos y estado de la partida. F solo se muestra cuando la partida terminó.
export function PanelEstado({ huevosIniciales, huevosDisponibles, intentos, estado, pisoCriticoRevelado }) {
  return (
    <dl className="estado">
      <div className="estado__fila">
        <dt>Huevos disponibles</dt>
        <dd>
          <span className="huevos" aria-hidden="true">
            {Array.from({ length: huevosIniciales }, (_, indice) => (
              <span key={indice} className={indice < huevosDisponibles ? 'huevo' : 'huevo huevo--roto'} />
            ))}
          </span>
          <span data-testid="huevos-disponibles">{huevosDisponibles}</span>
        </dd>
      </div>
      <div className="estado__fila">
        <dt>Intentos</dt>
        <dd data-testid="intentos">{intentos}</dd>
      </div>
      <div className="estado__fila">
        <dt>Partida</dt>
        <dd data-testid="estado-partida">{ETIQUETA_ESTADO_PARTIDA[estado]}</dd>
      </div>
      {pisoCriticoRevelado !== null && (
        <div className="estado__fila">
          <dt>Piso crítico</dt>
          <dd data-testid="piso-critico">{pisoCriticoRevelado}</dd>
        </div>
      )}
    </dl>
  )
}
