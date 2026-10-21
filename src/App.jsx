import { useState } from 'react'
import './App.css'
import { Encabezado } from './componentes/Encabezado.jsx'
import { PantallaEstrategias } from './componentes/PantallaEstrategias.jsx'
import { PantallaInicio } from './componentes/PantallaInicio.jsx'
import { PantallaSimulacion } from './componentes/PantallaSimulacion.jsx'
import { ESTADO_PARTIDA } from './dominio/Partida.js'
import { usePartida } from './hooks/usePartida.js'

const VISTA = Object.freeze({ MANUAL: 'manual', ESTRATEGIAS: 'estrategias' })

// V2 agrega la ejecución de estrategias sin quitar el modo manual (decisión D-02 de la ERS).
const VISTAS = [
  { id: VISTA.MANUAL, nombre: 'Lanzamiento manual' },
  { id: VISTA.ESTRATEGIAS, nombre: 'Ejecución de estrategias' },
]

export default function App() {
  const { partida, iniciar, lanzar, declarar, reiniciar } = usePartida()
  const [vista, setVista] = useState(VISTA.MANUAL)

  // LÓGICA (RF-06, CU-03): `_configuracion` es { modo, valor } (MODO_PISO en componentes/opciones.js);
  // quitar el guion bajo al usarla. Si modo es MODO_PISO.ELEGIDO, validar `valor` (Edificio.interpretarPiso):
  // si es válido, iniciar la partida con ese F, que debe seguir oculto; si no, no iniciar y devolver el
  // mensaje de error, por ejemplo «Piso crítico no válido: elige un número entero entre 1 y 100.». Definir
  // además si «Reiniciar» conserva el F elegido o genera uno aleatorio (RN-12). Mientras tanto, F siempre es aleatorio.
  const iniciarPartida = (_configuracion) => {
    iniciar()
    return null
  }

  let pantalla
  if (vista === VISTA.ESTRATEGIAS) {
    pantalla = <PantallaEstrategias />
  } else if (partida.estado === ESTADO_PARTIDA.SIN_INICIAR) {
    pantalla = <PantallaInicio onIniciar={iniciarPartida} />
  } else {
    pantalla = <PantallaSimulacion partida={partida} lanzar={lanzar} declarar={declarar} reiniciar={reiniciar} />
  }

  return (
    <div className="app">
      <Encabezado vistas={VISTAS} vista={vista} onCambiarVista={setVista} />
      {pantalla}
    </div>
  )
}
