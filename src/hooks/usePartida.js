import { useMemo, useState } from 'react'
import { Partida } from '../dominio/Partida.js'

// Conecta la clase Partida (mutable) con React: tras cada acción se publica una instantánea inmutable.
export function usePartida(opciones) {
  const [partida] = useState(() => new Partida(opciones))
  const [instantanea, setInstantanea] = useState(() => partida.instantanea())

  const acciones = useMemo(() => {
    const conActualizacion =
      (accion) =>
      (...argumentos) => {
        const resultado = accion(...argumentos)
        setInstantanea(partida.instantanea())
        return resultado
      }

    return {
      iniciar: conActualizacion(() => partida.iniciar()),
      lanzar: conActualizacion((piso) => partida.lanzar(piso)),
      declarar: conActualizacion((piso) => partida.declarar(piso)),
      reiniciar: conActualizacion((opcionesReinicio) => partida.reiniciar(opcionesReinicio)),
    }
  }, [partida])

  return { partida: instantanea, ...acciones }
}
