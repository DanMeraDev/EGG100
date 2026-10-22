import { useState } from 'react'
import { Edificio } from '../dominio/Edificio.js'
import { Partida } from '../dominio/Partida.js'
import { analizarTodasLasEstrategias } from '../dominio/estrategias/AnalizadorPeorCaso.js'
import { ejecutarEstrategia } from '../dominio/estrategias/Ejecutor.js'
import { siguientePisoOptima } from '../dominio/estrategias/EstrategiaOptima.js'
import { AnalisisPeorCaso } from './AnalisisPeorCaso.jsx'
import { ExplicacionOptima } from './ExplicacionOptima.jsx'
import { SecuenciaOptima } from './SecuenciaOptima.jsx'

const EDIFICIO = new Edificio()

// Pantalla «Análisis y resultados» del prototipo V3 (RF-11 a RF-15).
export function PantallaAnalisis() {
  const [pisoCritico, setPisoCritico] = useState('')
  const [secuencia, setSecuencia] = useState(null)
  const [errorPiso, setErrorPiso] = useState(null)
  const [analisis, setAnalisis] = useState(null)

  const cambiarPiso = (nuevoPiso) => {
    setPisoCritico(nuevoPiso)
    setErrorPiso(null)
  }

  // RF-11, RF-12 (CU-07): ejecuta la estrategia óptima para un piso crítico dado
  // y desglosa los lanzamientos realizados por cada huevo.
  const verSecuencia = () => {
    const piso = EDIFICIO.interpretarPiso(pisoCritico)
    if (piso === null) {
      setErrorPiso('Piso crítico no válido: elige un número entero entre 1 y 100.')
      setSecuencia(null)
      return
    }
    setErrorPiso(null)

    const partida = new Partida({ edificio: EDIFICIO })
    partida.iniciar({ pisoCritico: piso })
    const resultado = ejecutarEstrategia(partida, siguientePisoOptima)

    setSecuencia({
      pisoCritico: piso,
      lanzamientos: resultado.lanzamientos,
    })
  }

  // RF-13, RF-14 (CU-08): corre los 100 escenarios para todas las estrategias,
  // calcula su peor caso y corona a la estrategia con el menor peor caso.
  const analizar = () => {
    const resultado = analizarTodasLasEstrategias()
    setAnalisis(resultado)
  }

  return (
    <main className="analisis">
      <SecuenciaOptima
        pisoCritico={pisoCritico}
        errorPiso={errorPiso}
        secuencia={secuencia}
        onCambiarPiso={cambiarPiso}
        onVerSecuencia={verSecuencia}
      />
      <AnalisisPeorCaso analisis={analisis} onAnalizar={analizar} />
      <ExplicacionOptima />
    </main>
  )
}
