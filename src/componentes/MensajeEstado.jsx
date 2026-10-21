export function MensajeEstado({ mensaje }) {
  return (
    <p className={`mensaje mensaje--${mensaje.tono}`} role="status" data-testid="mensaje">
      {mensaje.texto}
    </p>
  )
}
