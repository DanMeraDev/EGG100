import './App.css'
import { Encabezado } from './componentes/Encabezado.jsx'
import { PantallaInicio } from './componentes/PantallaInicio.jsx'
import { PantallaSimulacion } from './componentes/PantallaSimulacion.jsx'
import { ESTADO_PARTIDA } from './dominio/Partida.js'
import { usePartida } from './hooks/usePartida.js'

export default function App() {
  const { partida, iniciar, lanzar, declarar, reiniciar } = usePartida()
  const sinIniciar = partida.estado === ESTADO_PARTIDA.SIN_INICIAR

  return (
    <div className="app">
      <Encabezado modo={sinIniciar ? 'Inicio' : 'Lanzamiento manual'} />
      {sinIniciar ? (
        <PantallaInicio onIniciar={iniciar} />
      ) : (
        <PantallaSimulacion partida={partida} lanzar={lanzar} declarar={declarar} reiniciar={reiniciar} />
      )}
    </div>
  )
}
