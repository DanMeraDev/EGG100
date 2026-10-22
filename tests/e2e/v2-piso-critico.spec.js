import { expect, test } from '@playwright/test'

// RF-06 (CP-06): el piso crítico elegido en la pantalla de inicio llega a la lógica y sigue oculto.
const mensaje = (page) => page.getByTestId('mensaje')
const boton = (page, nombre) => page.getByRole('button', { name: nombre, exact: true })
const campoPiso = (page) => page.getByLabel('Piso crítico (F)')

async function lanzarDesde(page, piso) {
  await page.getByLabel('Piso seleccionado').fill(String(piso))
  await boton(page, 'Lanzar').click()
}

async function iniciarConPisoElegido(page, valor) {
  await page.goto('/')
  await page.getByRole('radio', { name: 'Elegido' }).check()
  await campoPiso(page).fill(String(valor))
  await page.getByRole('button', { name: 'Iniciar partida' }).click()
}

test.describe('Prototipo V2 · RF-06 piso crítico configurado', () => {
  test('CP-06: con F = 40 sobrevive en 39 y se rompe en 40, y F sigue oculto', async ({ page }) => {
    await iniciarConPisoElegido(page, 40)
    await expect(page.getByTestId('piso-critico-oculto')).toHaveText('Oculto')

    await lanzarDesde(page, 39)
    await expect(mensaje(page)).toContainText('sobrevivió en el piso 39')
    await lanzarDesde(page, 40)
    await expect(mensaje(page)).toContainText('se rompió en el piso 40')
    await expect(page.getByTestId('piso-critico')).toHaveCount(0)
  })

  test('un F no válido muestra el error y no inicia la partida', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('radio', { name: 'Elegido' }).check()

    for (const valor of ['', '0', '101', '2.5']) {
      await campoPiso(page).fill(valor)
      await page.getByRole('button', { name: 'Iniciar partida' }).click()
      await expect(page.getByRole('alert')).toHaveText(
        'Piso crítico no válido: elige un número entero entre 1 y 100.',
      )
      await expect(page.getByRole('heading', { name: 'Estado y lanzamiento' })).toHaveCount(0)
    }

    await campoPiso(page).fill('100')
    await page.getByRole('button', { name: 'Iniciar partida' }).click()
    await expect(page.getByRole('heading', { name: 'Estado y lanzamiento' })).toBeVisible()
  })

  test('el modo aleatorio sigue funcionando como en V1', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.395
    })
    await page.goto('/')
    await page.getByRole('button', { name: 'Iniciar partida' }).click()
    await lanzarDesde(page, 39)
    await expect(mensaje(page)).toContainText('sobrevivió en el piso 39')
    await lanzarDesde(page, 40)
    await expect(mensaje(page)).toContainText('se rompió en el piso 40')
  })

  test('Reiniciar no conserva el F elegido: genera uno aleatorio nuevo', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.695
    })
    await iniciarConPisoElegido(page, 40)
    await lanzarDesde(page, 50)
    await expect(mensaje(page)).toContainText('se rompió en el piso 50')

    await boton(page, 'Reiniciar').click()
    await page
      .getByRole('dialog', { name: '¿Reiniciar la partida?' })
      .getByRole('button', { name: 'Sí, reiniciar' })
      .click()

    // Con Math.random fijo en 0.695, el nuevo F es 70: el piso 50 ahora sobrevive.
    await lanzarDesde(page, 50)
    await expect(mensaje(page)).toContainText('sobrevivió en el piso 50')
  })
})
