import { CampoPiso } from './CampoPiso.jsx'
import { SelectorEstrategia } from './SelectorEstrategia.jsx'

// Panel central del wireframe V2: estrategia, piso crítico y botones Ejecutar y Reiniciar.
export function ControlesEstrategia({
  estrategia,
  pisoCritico,
  errorPiso,
  onCambiarEstrategia,
  onCambiarPiso,
  onEjecutar,
  onReiniciar,
}) {
  const enviar = (evento) => {
    evento.preventDefault()
    onEjecutar()
  }

  return (
    <form className="controles" noValidate onSubmit={enviar}>
      <SelectorEstrategia seleccionada={estrategia} onSeleccionar={onCambiarEstrategia} />
      <CampoPiso
        id="piso-critico-estrategia"
        etiqueta="Piso crítico (F)"
        valor={pisoCritico}
        error={errorPiso}
        onCambiar={onCambiarPiso}
      />
      <p className="nota">Para comparar, ejecuta las dos estrategias con el mismo piso crítico.</p>
      <button type="submit" className="boton boton--primario">
        Ejecutar
      </button>
      <button type="button" className="boton" onClick={onReiniciar}>
        Reiniciar
      </button>
    </form>
  )
}
