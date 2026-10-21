import { Instrucciones } from './Instrucciones.jsx'

// Pantalla de inicio (D6: Pantalla Inicio → Simulación).
export function PantallaInicio({ onIniciar }) {
  return (
    <main className="inicio">
      <h2>Problema de los dos huevos y los 100 pisos</h2>
      <p className="inicio__intro">
        Descubre desde qué piso se rompe un huevo usando solo dos huevos. Cada lanzamiento te da información: úsala
        bien.
      </p>
      <Instrucciones />
      <button type="button" className="boton boton--primario boton--grande" onClick={onIniciar}>
        Iniciar partida
      </button>
    </main>
  )
}
