import { expect, test } from '@playwright/test'

// Solo comprueba la interfaz de V2: la lógica de las estrategias todavía no está conectada.
const boton = (page, nombre) => page.getByRole('button', { name: nombre, exact: true })

async function abrirEstrategias(page) {
  await page.goto('/')
  await boton(page, 'Ejecución de estrategias').click()
}

test.describe('Prototipo V2 · interfaz', () => {
  test('la barra cambia de sección y la partida manual se conserva', async ({ page }) => {
    await page.goto('/')
    await expect(boton(page, 'Lanzamiento manual')).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Iniciar partida' }).click()
    await page.getByLabel('Piso seleccionado').fill('30')
    await boton(page, 'Lanzar').click()

    await boton(page, 'Ejecución de estrategias').click()
    await expect(boton(page, 'Ejecución de estrategias')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('heading', { name: 'Estrategia y simulación' })).toBeVisible()

    await boton(page, 'Lanzamiento manual').click()
    await expect(page.getByTestId('intentos')).toHaveText('1')
    await expect(page.getByTestId('mensaje')).toHaveText('Partida en curso. Selecciona un piso y pulsa «Lanzar».')
  })

  test('RF-06: al iniciar se puede elegir el piso crítico y durante la búsqueda se muestra oculto', async ({ page }) => {
    await page.goto('/')
    const campo = page.getByLabel('Piso crítico (F)')
    await expect(campo).toHaveCount(0)

    await page.getByRole('radio', { name: 'Elegido' }).check()
    await campo.fill('40')
    await page.getByRole('button', { name: 'Iniciar partida' }).click()

    await expect(page.getByTestId('piso-critico-oculto')).toHaveText('Oculto')
    await expect(page.getByTestId('piso-critico')).toHaveCount(0)
  })

  test('RF-07: se elige la estrategia y se confirma la estrategia activa', async ({ page }) => {
    await abrirEstrategias(page)
    const activa = page.getByTestId('estrategia-activa')
    await expect(page.getByRole('radio', { name: 'Secuencial' })).toBeChecked()
    await expect(activa).toHaveText('Secuencial')

    await page.getByRole('radio', { name: 'Saltos de 10' }).check()
    await expect(activa).toHaveText('Saltos de 10')
    await expect(page.getByLabel('Piso crítico (F)')).toBeVisible()
  })

  test('RF-09 y RF-10: historial y comparación empiezan vacíos y la comparación no se presenta como peor caso', async ({
    page,
  }) => {
    await abrirEstrategias(page)
    await expect(page.getByRole('region', { name: 'Historial' })).toContainText('Aún no hay lanzamientos.')

    const comparacion = page.getByRole('region', { name: 'Comparación' })
    await expect(comparacion.getByRole('row')).toHaveCount(4)
    await expect(comparacion.getByText('Sin ejecutar')).toHaveCount(3)
    await expect(comparacion.getByTestId('conclusion-comparacion')).toHaveText(
      'Falta ejecutar «Secuencial», «Saltos de 10» y «Óptima» con este piso crítico para poder comparar.',
    )
    await expect(comparacion).toContainText('no es el peor caso')
  })
})
