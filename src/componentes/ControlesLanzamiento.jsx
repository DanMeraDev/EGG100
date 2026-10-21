// CU-01: piso seleccionado y acciones Lanzar, Declarar y Reiniciar.
export function ControlesLanzamiento({
  piso,
  totalPisos,
  enCurso,
  puedeLanzar,
  sugerirDeclarar,
  onCambiarPiso,
  onLanzar,
  onDeclarar,
  onReiniciar,
}) {
  const enviar = (evento) => {
    evento.preventDefault()
    onLanzar()
  }

  // noValidate: el rango lo valida el dominio para mostrar siempre el mismo mensaje (RF-02).
  return (
    <form className="controles" noValidate onSubmit={enviar}>
      <div className="campo">
        <label htmlFor="piso-seleccionado">Piso seleccionado</label>
        <input
          id="piso-seleccionado"
          type="number"
          inputMode="numeric"
          min={1}
          max={totalPisos}
          step={1}
          placeholder={`1–${totalPisos}`}
          value={piso}
          disabled={!enCurso}
          onChange={(evento) => onCambiarPiso(evento.target.value)}
        />
      </div>
      <button type="submit" className="boton boton--primario" disabled={!puedeLanzar}>
        Lanzar
      </button>
      <button
        type="button"
        className={sugerirDeclarar ? 'boton boton--sugerido' : 'boton'}
        disabled={!enCurso}
        onClick={onDeclarar}
      >
        Declarar
      </button>
      <button type="button" className="boton" onClick={onReiniciar}>
        Reiniciar
      </button>
    </form>
  )
}
