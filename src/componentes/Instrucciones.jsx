import { HUEVOS_INICIALES, TOTAL_PISOS } from '../dominio/constantes.js'

// Instrucciones disponibles en todo momento (RNF-01).
export function Instrucciones() {
  return (
    <div className="instrucciones">
      <h3>Reglas</h3>
      <ul>
        <li>
          El edificio tiene {TOTAL_PISOS} pisos y un <strong>piso crítico F</strong> oculto, elegido al azar entre 1 y{' '}
          {TOTAL_PISOS}.
        </li>
        <li>
          Desde un piso <strong>menor que F</strong> el huevo sobrevive; desde <strong>F o más arriba</strong>, se
          rompe.
        </li>
        <li>
          Tienes <strong>{HUEVOS_INICIALES} huevos</strong>: el que sobrevive se reutiliza; el que se rompe, no.
        </li>
      </ul>
      <h3>Cómo jugar</h3>
      <ol>
        <li>
          Elige un piso en el edificio (o escríbelo) y pulsa <strong>Lanzar</strong>.
        </li>
        <li>
          La torre solo colorea lo que se deduce: <span className="texto-seguro">verde</span> = seguro,{' '}
          <span className="texto-rotura">rojo</span> = rotura, gris = desconocido.
        </li>
        <li>Lanzar desde un piso cuyo resultado ya se conoce no cuenta como intento.</li>
        <li>
          Cuando la evidencia deje un único piso posible, pulsa <strong>Declarar</strong> e indica F.
        </li>
        <li>Si te quedas sin huevos sin poder determinar F, la partida termina como no resuelta.</li>
      </ol>
    </div>
  )
}
