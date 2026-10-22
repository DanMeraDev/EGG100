import { useState } from 'react'
import { AnalisisPeorCaso } from './AnalisisPeorCaso.jsx'
import { ExplicacionOptima } from './ExplicacionOptima.jsx'
import { SecuenciaOptima } from './SecuenciaOptima.jsx'

// Pantalla «Análisis y resultados» del prototipo V3 (wireframe del mismo nombre). Solo interfaz: los
// comentarios «LÓGICA» indican qué debe aportar la lógica; mientras tanto se muestran los estados iniciales.
export function PantallaAnalisis() {
  const [pisoCritico, setPisoCritico] = useState('')

  // LÓGICA (RF-11, RF-12): ejecución de la estrategia óptima con el F indicado, o null si todavía no hay ninguna.
  // Forma esperada: { pisoCritico, lanzamientos: [{ numero, piso, resultado }] } en orden de lanzamiento.
  const secuencia = null

  // LÓGICA (RF-06): mensaje de error si `pisoCritico` no es un entero entre 1 y 100; null si es válido.
  const errorPiso = null

  // LÓGICA (RF-13, RF-14): resultado de analizar los 100 pisos críticos, o null si todavía no se ejecutó.
  // Forma esperada:
  //   {
  //     peorCaso,       // { [id de ESTRATEGIA]: máximo de lanzamientos con F = 1…100, o null si falta (CU-08) }
  //     menorPeorCaso,  // ids de las estrategias con el menor peor caso (varios si empatan)
  //     optimaValida,   // false si la óptima supera 14 lanzamientos en algún escenario (CU-07)
  //   }
  const analisis = null

  const verSecuencia = () => {
    // LÓGICA (RF-11, RF-12): validar `pisoCritico` (Edificio.interpretarPiso) y, si es válido, ejecutar la
    // estrategia óptima con ese F (2 huevos; se rompe si piso ≥ F) y guardar el resultado en `secuencia`.
  }

  const analizar = () => {
    // LÓGICA (RF-11, RF-13, RF-14): ejecutar cada estrategia con F = 1, 2, …, 100 bajo las mismas reglas,
    // obtener el máximo de lanzamientos de cada una y guardar el resultado en `analisis`.
  }

  return (
    <main className="analisis">
      <SecuenciaOptima
        pisoCritico={pisoCritico}
        errorPiso={errorPiso}
        secuencia={secuencia}
        onCambiarPiso={setPisoCritico}
        onVerSecuencia={verSecuencia}
      />
      <AnalisisPeorCaso analisis={analisis} onAnalizar={analizar} />
      <ExplicacionOptima />
    </main>
  )
}
