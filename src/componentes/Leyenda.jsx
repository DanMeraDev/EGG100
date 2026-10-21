import { ESTADO_PISO } from '../dominio/RegistroInferencias.js'

const ELEMENTOS = [
  { estado: ESTADO_PISO.SEGURO, nombre: 'Piso seguro', detalle: 'El huevo sobrevive' },
  { estado: ESTADO_PISO.ROTURA, nombre: 'Piso roto', detalle: 'El huevo se rompe' },
  { estado: ESTADO_PISO.DESCONOCIDO, nombre: 'Desconocido', detalle: 'Sin información todavía' },
]

// RF-19: explica los colores de la torre sin revelar F.
export function Leyenda() {
  return (
    <section className="panel" aria-labelledby="titulo-leyenda">
      <h2 id="titulo-leyenda">Leyenda</h2>
      <ul className="leyenda">
        {ELEMENTOS.map(({ estado, nombre, detalle }) => (
          <li key={estado}>
            <span className={`muestra muestra--${estado}`} aria-hidden="true" />
            <span>
              <strong>{nombre}</strong>
              <small>{detalle}</small>
            </span>
          </li>
        ))}
      </ul>
      <p className="nota">Solo se colorea lo que se puede deducir de tus lanzamientos.</p>
    </section>
  )
}
