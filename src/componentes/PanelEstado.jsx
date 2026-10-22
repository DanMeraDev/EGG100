import { ETIQUETA_ESTADO_PARTIDA } from './etiquetas.js'

// CU-02: huevos, intentos y estado de la partida. F se muestra como «Oculto» hasta que la partida termina (RF-06).
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
      <div className="estado__fila">
        <dt>Piso crítico</dt>
        {pisoCriticoRevelado === null ? (
          <dd className="estado__oculto" data-testid="piso-critico-oculto">
            Oculto
          </dd>
        ) : (
          <dd data-testid="piso-critico">{pisoCriticoRevelado}</dd>
        )}
      </div>
    </dl>
  )
}
