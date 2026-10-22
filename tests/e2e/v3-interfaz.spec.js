import { expect, test } from '@playwright/test'

// Solo comprueba la interfaz de V3: la lógica de las estrategias y del análisis todavía no está conectada.
const boton = (page, nombre) => page.getByRole('button', { name: nombre, exact: true })

async function abrir(page, pestana) {
  await page.goto('/')
  await boton(page, pestana).click()
  await expect(boton(page, pestana)).toHaveAttribute('aria-pressed', 'true')
}

test.describe('Prototipo V3 · interfaz', () => {
  test('la estrategia Óptima ya se puede elegir y el resumen espera una ejecución (RF-16)', async ({ page }) => {
    await abrir(page, 'Ejecución de estrategias')
    const optima = page.getByRole('radio', { name: 'Óptima' })
    await expect(optima).toBeEnabled()
    await optima.check()
    await expect(page.getByTestId('estrategia-activa')).toHaveText('Óptima')
    await expect(page.getByRole('region', { name: 'Resumen' })).toContainText(
      'El resumen aparecerá al terminar una ejecución.',
    )
  })

  test('RF-12: la secuencia óptima pide un piso crítico antes de mostrarse', async ({ page }) => {
    await abrir(page, 'Análisis y resultados')
    const secuencia = page.getByRole('region', { name: 'Secuencia óptima' })
    await expect(secuencia.getByLabel('Piso crítico (F)')).toBeVisible()
    await expect(secuencia.getByRole('button', { name: 'Ver secuencia' })).toBeVisible()
    await expect(secuencia).toContainText('Indica un piso crítico y pulsa «Ver secuencia»')
  })

  test('RF-13 y RF-14: el análisis lista las tres estrategias y distingue el peor caso de una partida', async ({
    page,
  }) => {
    await abrir(page, 'Análisis y resultados')
    const analisis = page.getByRole('region', { name: 'Análisis de 100 escenarios' })
    await expect(analisis.getByRole('listitem')).toHaveCount(3)
    await expect(analisis.getByText('Sin analizar')).toHaveCount(3)
    await expect(analisis.getByTestId('conclusion-peor-caso')).toHaveText(
      'Pulsa «Analizar los 100 escenarios» para calcular el peor caso de cada estrategia.',
    )
    await expect(analisis).toContainText('Una partida concreta puede necesitar menos.')
  })

  test('RF-15: la explicación muestra que 13 lanzamientos cubren 91 pisos y 14 cubren 105', async ({ page }) => {
    await abrir(page, 'Análisis y resultados')
    const explicacion = page.getByRole('region', { name: '¿Por qué 14 lanzamientos?' })
    const filas = explicacion.getByRole('list', { name: 'Pisos que se cubren según los lanzamientos' }).getByRole('listitem')
    await expect(filas).toHaveCount(2)
    await expect(filas.nth(0)).toContainText('13 lanzamientos: hasta 91 pisos')
    await expect(filas.nth(0)).toContainText('13 + 12 + … + 1 = 91')
    await expect(filas.nth(0)).toContainText('No alcanzan para 100 pisos')
    await expect(filas.nth(1)).toContainText('14 lanzamientos: hasta 105 pisos')
    await expect(filas.nth(1)).toContainText('14 + 13 + … + 1 = 105')
    await expect(filas.nth(1)).not.toContainText('No alcanzan')
    await expect(explicacion).toContainText('por eso 14 es el mínimo')
  })
})
