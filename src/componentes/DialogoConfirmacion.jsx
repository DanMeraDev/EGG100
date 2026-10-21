import { Dialogo } from './Dialogo.jsx'

export function DialogoConfirmacion({ titulo, textoConfirmar, onConfirmar, onCancelar, children }) {
  return (
    <Dialogo titulo={titulo} onCancelar={onCancelar}>
      <p>{children}</p>
      <div className="dialogo__acciones">
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className="boton boton--peligro" onClick={onConfirmar}>
          {textoConfirmar}
        </button>
      </div>
    </Dialogo>
  )
}
