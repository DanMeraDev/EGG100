import { TOTAL_PISOS } from '../dominio/constantes.js'

// Campo para escribir un piso. El rango lo valida la lógica, por eso los formularios usan noValidate.
export function CampoPiso({ id, etiqueta, valor, error, onCambiar }) {
  const idError = `${id}-error`

  return (
    <>
      <div className="campo">
        <label htmlFor={id}>{etiqueta}</label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={TOTAL_PISOS}
          step={1}
          placeholder={`1–${TOTAL_PISOS}`}
          value={valor}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          onChange={(evento) => onCambiar(evento.target.value)}
        />
      </div>
      {error && (
        <p id={idError} className="campo__error" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
