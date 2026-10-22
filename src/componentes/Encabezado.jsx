import { PROTOTIPO } from '../prototipo.js'

export function Encabezado({ vistas, vista, onCambiarVista }) {
  return (
    <header className="barra">
      <div className="barra__titulo">
        <span className="barra__logo" aria-hidden="true" />
        <h1>EGG100 · Simulador de los dos huevos</h1>
      </div>
      <nav className="barra__vistas" aria-label="Secciones del simulador">
        {vistas.map(({ id, nombre }) => (
          <button
            key={id}
            type="button"
            className="pestana"
            aria-pressed={id === vista}
            onClick={() => onCambiarVista(id)}
          >
            {nombre}
          </button>
        ))}
      </nav>
      <span className="barra__version">
        Prototipo {PROTOTIPO.version} · {PROTOTIPO.nombre}
      </span>
    </header>
  )
}
