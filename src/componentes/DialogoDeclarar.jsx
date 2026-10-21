import { useState } from 'react'
import { Dialogo } from './Dialogo.jsx'

// CU-10: el usuario indica qué piso cree que es F.
export function DialogoDeclarar({ valorInicial, totalPisos, onDeclarar, onCancelar }) {
  const [valor, setValor] = useState(valorInicial)
  const [error, setError] = useState(null)

  const enviar = (evento) => {
    evento.preventDefault()
    setError(onDeclarar(valor))
  }

  return (
    <Dialogo titulo="Declarar piso crítico" onCancelar={onCancelar}>
      <form noValidate onSubmit={enviar}>
        <p>Solo se acepta si tus lanzamientos demuestran que es el único piso posible.</p>
        <div className="campo">
          <label htmlFor="piso-declarado">Piso crítico (F)</label>
          <input
            id="piso-declarado"
            type="number"
            inputMode="numeric"
            min={1}
            max={totalPisos}
            step={1}
            value={valor}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'error-declaracion' : undefined}
            onChange={(evento) => setValor(evento.target.value)}
          />
        </div>
        {error && (
          <p id="error-declaracion" className="dialogo__error" role="alert">
            {error}
          </p>
        )}
        <div className="dialogo__acciones">
          <button type="button" className="boton" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="boton boton--primario">
            Confirmar
          </button>
        </div>
      </form>
    </Dialogo>
  )
}
