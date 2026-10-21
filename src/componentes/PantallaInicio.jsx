import { useState } from 'react'
import { ConfigPisoCritico } from './ConfigPisoCritico.jsx'
import { Instrucciones } from './Instrucciones.jsx'
import { MODO_PISO } from './opciones.js'

// Pantalla de inicio (D6: Pantalla Inicio → Simulación). Desde V2 permite elegir el piso crítico (RF-06).
export function PantallaInicio({ onIniciar }) {
  const [configuracion, setConfiguracion] = useState({ modo: MODO_PISO.ALEATORIO, valor: '' })
  const [error, setError] = useState(null)

  const cambiarConfiguracion = (nueva) => {
    setConfiguracion(nueva)
    setError(null)
  }

  // onIniciar devuelve el mensaje de error si el piso elegido no es válido; en ese caso no inicia la partida.
  const enviar = (evento) => {
    evento.preventDefault()
    setError(onIniciar(configuracion))
  }

  return (
    <main className="inicio">
      <h2>Problema de los dos huevos y los 100 pisos</h2>
      <p className="inicio__intro">
        Descubre desde qué piso se rompe un huevo usando solo dos huevos. Cada lanzamiento te da información: úsala
        bien.
      </p>
      <Instrucciones />
      <form className="inicio__formulario" noValidate onSubmit={enviar}>
        <ConfigPisoCritico configuracion={configuracion} error={error} onCambiar={cambiarConfiguracion} />
        <button type="submit" className="boton boton--primario boton--grande">
          Iniciar partida
        </button>
      </form>
    </main>
  )
}
