import { PROTOTIPO } from '../prototipo.js'

export function Encabezado({ modo }) {
  return (
    <header className="barra">
      <div className="barra__titulo">
        <span className="barra__logo" aria-hidden="true" />
        <h1>EGG100 · Simulador de los dos huevos</h1>
        <span className="barra__modo">({modo})</span>
      </div>
      <span className="barra__version">
        Prototipo {PROTOTIPO.version} · {PROTOTIPO.nombre}
      </span>
    </header>
  )
}
