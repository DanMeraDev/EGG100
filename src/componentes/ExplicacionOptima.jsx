// Contenido fijo de RF-15: no depende de la lógica.
const COBERTURA = [
  { lanzamientos: 13, suma: '13 + 12 + … + 1', pisos: 91, alcanza: false },
  { lanzamientos: 14, suma: '14 + 13 + … + 1', pisos: 105, alcanza: true },
]

// RF-15 (CU-07): por qué 14 lanzamientos son el mínimo con 100 pisos y dos huevos.
export function ExplicacionOptima() {
  return (
    <section className="panel" aria-labelledby="titulo-explicacion">
      <h2 id="titulo-explicacion">¿Por qué 14 lanzamientos?</h2>
      <ol className="explicacion__pasos">
        <li>
          Si el primer huevo se lanza desde el piso <em>n</em> y se rompe, el segundo revisa uno por uno los <em>n</em>{' '}
          − 1 pisos de abajo: <em>n</em> lanzamientos en total.
        </li>
        <li>
          Cada vez que el primer huevo sobrevive se gasta un lanzamiento, así que el siguiente salto debe ser un piso
          más corto: <em>n</em>, <em>n</em> − 1, <em>n</em> − 2… (saltos decrecientes).
        </li>
        <li>
          Así, <em>n</em> lanzamientos cubren como máximo <em>n</em> + (<em>n</em> − 1) + … + 1 = <em>n</em>(
          <em>n</em> + 1)/2 pisos.
        </li>
      </ol>
      <ul className="cobertura" aria-label="Pisos que se cubren según los lanzamientos">
        {COBERTURA.map(({ lanzamientos, suma, pisos, alcanza }) => (
          <li key={lanzamientos} data-alcanza={alcanza ? 'true' : 'false'}>
            <strong>
              {lanzamientos} lanzamientos: hasta {pisos} pisos
            </strong>
            <span className="cobertura__suma">
              {suma} = {pisos}
            </span>
            <span className={alcanza ? 'insignia' : 'insignia insignia--no'}>
              {alcanza ? 'Alcanzan para 100 pisos' : 'No alcanzan para 100 pisos'}
            </span>
          </li>
        ))}
      </ul>
      <p className="explicacion__conclusion">
        Con 13 lanzamientos no alcanza y con 14 sí: por eso 14 es el mínimo que garantiza encontrar el piso crítico en
        el peor caso.
      </p>
      <p className="nota">
        La estrategia óptima aplica esta idea: empieza en el piso 14 y luego salta 13, 12, 11… pisos (14, 27, 39, 50…).
      </p>
    </section>
  )
}
