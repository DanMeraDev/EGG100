import { CampoPiso } from './CampoPiso.jsx'
import { MODO_PISO } from './opciones.js'

// RF-06 (CU-03): F aleatorio por defecto u opcionalmente elegido; en ambos casos queda oculto durante la búsqueda.
export function ConfigPisoCritico({ configuracion, error, onCambiar }) {
  const { modo, valor } = configuracion
  const cambiarModo = (nuevoModo) => onCambiar({ ...configuracion, modo: nuevoModo })

  return (
    <fieldset className="grupo-opciones">
      <legend>Piso crítico</legend>
      <label className="opcion">
        <input
          type="radio"
          name="modo-piso"
          value={MODO_PISO.ALEATORIO}
          checked={modo === MODO_PISO.ALEATORIO}
          onChange={() => cambiarModo(MODO_PISO.ALEATORIO)}
        />
        <span>Aleatorio</span>
        <small>El simulador elige F entre 1 y 100.</small>
      </label>
      <label className="opcion">
        <input
          type="radio"
          name="modo-piso"
          value={MODO_PISO.ELEGIDO}
          checked={modo === MODO_PISO.ELEGIDO}
          onChange={() => cambiarModo(MODO_PISO.ELEGIDO)}
        />
        <span>Elegido</span>
        <small>Indicas tú el valor de F.</small>
      </label>
      {modo === MODO_PISO.ELEGIDO && (
        <CampoPiso
          id="piso-critico-inicio"
          etiqueta="Piso crítico (F)"
          valor={valor}
          error={error}
          onCambiar={(nuevoValor) => onCambiar({ ...configuracion, valor: nuevoValor })}
        />
      )}
      <p className="nota">Mientras buscas, F permanece oculto.</p>
    </fieldset>
  )
}
