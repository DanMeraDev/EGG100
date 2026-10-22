import { useState } from 'react'
import './App.css'
import { Encabezado } from './componentes/Encabezado.jsx'
import { PantallaAnalisis } from './componentes/PantallaAnalisis.jsx'
import { PantallaEstrategias } from './componentes/PantallaEstrategias.jsx'
import { PantallaInicio } from './componentes/PantallaInicio.jsx'
import { PantallaSimulacion } from './componentes/PantallaSimulacion.jsx'
import { MODO_PISO } from './componentes/opciones.js'
import { Edificio } from './dominio/Edificio.js'
import { ESTADO_PARTIDA } from './dominio/Partida.js'
import { usePartida } from './hooks/usePartida.js'

const VISTA = Object.freeze({ MANUAL: 'manual', ESTRATEGIAS: 'estrategias', ANALISIS: 'analisis' })

// V2 agrega la ejecución de estrategias sin quitar el modo manual (decisión D-02 de la ERS) y V3, el análisis.
const VISTAS = [
  { id: VISTA.MANUAL, nombre: 'Lanzamiento manual' },
  { id: VISTA.ESTRATEGIAS, nombre: 'Ejecución de estrategias' },
  { id: VISTA.ANALISIS, nombre: 'Análisis y resultados' },
]

const EDIFICIO = new Edificio()
const ERROR_PISO_CRITICO = 'Piso crítico no válido: elige un número entero entre 1 y 100.'

export default function App() {
  const { partida, iniciar, lanzar, declarar, reiniciar } = usePartida()
  const [vista, setVista] = useState(VISTA.MANUAL)

  // RF-06 (CU-03): `configuracion` es { modo, valor } (MODO_PISO en componentes/opciones.js).
  // Con F elegido y válido se inicia la partida con ese F (sigue oculto); si no, no se inicia y se devuelve
  // el mensaje de error. «Reiniciar» no conserva F: genera uno aleatorio nuevo (RN-12).
  const iniciarPartida = ({ modo, valor }) => {
    if (modo !== MODO_PISO.ELEGIDO) {
      iniciar()
      return null
    }
    const pisoCritico = EDIFICIO.interpretarPiso(valor)
    if (pisoCritico === null) {
      return ERROR_PISO_CRITICO
    }
    iniciar({ pisoCritico })
    return null
  }

  let pantalla
  if (vista === VISTA.ANALISIS) {
    pantalla = <PantallaAnalisis />
  } else if (vista === VISTA.ESTRATEGIAS) {
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
