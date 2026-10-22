import { ESTRATEGIAS } from './opciones.js'

// RF-07 (CU-04): elegir la estrategia y confirmar cuál está activa. Las no disponibles se muestran bloqueadas.
export function SelectorEstrategia({ seleccionada, onSeleccionar }) {
  const activa = ESTRATEGIAS.find(({ id }) => id === seleccionada)

  return (
    <fieldset className="grupo-opciones">
      <legend>Estrategia</legend>
      {ESTRATEGIAS.map(({ id, nombre, disponible, aviso }) => (
        <label key={id} className={disponible ? 'opcion' : 'opcion opcion--bloqueada'}>
          <input
            type="radio"
            name="estrategia"
            value={id}
            checked={id === seleccionada}
            disabled={!disponible}
            onChange={() => onSeleccionar(id)}
          />
          <span>{nombre}</span>
          {!disponible && <small className="etiqueta-aviso">{aviso}</small>}
        </label>
      ))}
      <p className="estrategia-activa">
        Estrategia activa: <strong data-testid="estrategia-activa">{activa.nombre}</strong>
      </p>
      <p className="nota">{activa.descripcion}</p>
    </fieldset>
  )
}
