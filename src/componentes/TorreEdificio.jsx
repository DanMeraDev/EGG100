import { ETIQUETA_ESTADO_PISO } from './etiquetas.js'

// RF-01, RF-02 y RF-19: pisos de arriba (100) hacia abajo (1), coloreados solo con lo que se deduce.
export function TorreEdificio({ pisos, pisoSeleccionado, deshabilitada, onSeleccionar }) {
  const deArribaAAbajo = [...pisos].reverse()

  return (
    <section className="panel torre" aria-labelledby="titulo-torre">
      <h2 id="titulo-torre">Edificio de {pisos.length} pisos</h2>
      <ul className="torre__pisos">
        {deArribaAAbajo.map(({ numero, estado }) => (
          <li key={numero}>
            <button
              type="button"
              className="piso"
              data-piso={numero}
              data-estado={estado}
              aria-pressed={numero === pisoSeleccionado}
              aria-label={`Piso ${numero}, ${ETIQUETA_ESTADO_PISO[estado]}`}
              disabled={deshabilitada}
              onClick={() => onSeleccionar(numero)}
            >
              {numero}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
