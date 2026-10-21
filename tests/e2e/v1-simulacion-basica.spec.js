import { expect, test } from '@playwright/test'

// Fija Math.random antes de cargar la app para conocer F en la prueba sin exponerlo en la interfaz.
async function iniciarPartida(page, pisoCritico) {
  await page.addInitScript((f) => {
    Math.random = () => (f - 0.5) / 100
  }, pisoCritico)
  await page.goto('/')
  await page.getByRole('button', { name: 'Iniciar partida' }).click()
}

async function lanzarDesde(page, piso) {
  await page.getByLabel('Piso seleccionado').fill(String(piso))
  await page.getByRole('button', { name: 'Lanzar', exact: true }).click()
}

async function declarar(page, piso) {
  await page.getByRole('button', { name: 'Declarar', exact: true }).click()
  const dialogo = page.getByRole('dialog', { name: 'Declarar piso crítico' })
  await dialogo.getByLabel('Piso crítico (F)').fill(String(piso))
  await dialogo.getByRole('button', { name: 'Confirmar', exact: true }).click()
  await expect(dialogo).toHaveCount(0)
}

const piso = (page, numero) => page.locator(`[data-piso="${numero}"]`)
const pisosEn = (page, estado) => page.locator(`[data-piso][data-estado="${estado}"]`)
const mensaje = (page) => page.getByTestId('mensaje')
const intentos = (page) => page.getByTestId('intentos')
const huevos = (page) => page.getByTestId('huevos-disponibles')
const estadoPartida = (page) => page.getByTestId('estado-partida')
const filasHistorial = (page) => page.locator('tbody tr[data-resultado]')
const boton = (page, nombre) => page.getByRole('button', { name: nombre, exact: true })

test.describe('Prototipo V1 · simulación básica', () => {
  test('CP-01, CP-02, CP-19: muestra 100 pisos sin revelar F y valida el piso elegido', async ({ page }) => {
    await iniciarPartida(page, 40)

    const pisos = page.locator('[data-piso]')
    await expect(pisos).toHaveCount(100)
    await expect(pisos.first()).toHaveText('100')
    await expect(pisos.last()).toHaveText('1')
    await expect(pisosEn(page, 'desconocido')).toHaveCount(100)
    await expect(page.getByTestId('piso-critico')).toHaveCount(0)

    await piso(page, 25).click()
    await expect(page.getByLabel('Piso seleccionado')).toHaveValue('25')
    await expect(piso(page, 25)).toHaveAttribute('aria-pressed', 'true')

    for (const valor of [0, 101]) {
      await lanzarDesde(page, valor)
      await expect(mensaje(page)).toContainText('Piso no válido')
    }
    await expect(intentos(page)).toHaveText('0')
    await expect(huevos(page)).toHaveText('2')
  })

  test('CP-03, CP-04, CP-05, CP-19: cada lanzamiento actualiza huevos, intentos, historial e inferencias', async ({
    page,
  }) => {
    await iniciarPartida(page, 40)

    await lanzarDesde(page, 39)
    await expect(mensaje(page)).toContainText('sobrevivió en el piso 39')
    await expect(intentos(page)).toHaveText('1')
    await expect(huevos(page)).toHaveText('2')
    await expect(pisosEn(page, 'seguro')).toHaveCount(39)
    await expect(pisosEn(page, 'rotura')).toHaveCount(0)

    await lanzarDesde(page, 41)
    await expect(mensaje(page)).toContainText('se rompió en el piso 41')
    await expect(intentos(page)).toHaveText('2')
    await expect(huevos(page)).toHaveText('1')
    await expect(pisosEn(page, 'rotura')).toHaveCount(60)
    await expect(piso(page, 40)).toHaveAttribute('data-estado', 'desconocido')

    await expect(filasHistorial(page)).toHaveCount(2)
    await expect(filasHistorial(page).nth(0).locator('td')).toHaveText(['1', '39', 'Intacto'])
    await expect(filasHistorial(page).nth(1).locator('td')).toHaveText(['2', '41', 'Roto'])
  })

  test('CP-20: un intento redundante avisa y no modifica huevos, contador ni historial', async ({ page }) => {
    await iniciarPartida(page, 40)
    await lanzarDesde(page, 39)

    await lanzarDesde(page, 20)
    await expect(mensaje(page)).toContainText('Intento redundante')
    await expect(intentos(page)).toHaveText('1')
    await expect(huevos(page)).toHaveText('2')
    await expect(filasHistorial(page)).toHaveCount(1)
  })

  test('CP-18: distingue declaración sin evidencia, incorrecta y correcta', async ({ page }) => {
    await iniciarPartida(page, 40)
    await lanzarDesde(page, 39)

    await declarar(page, 40)
    await expect(mensaje(page)).toContainText('Aún no hay evidencia suficiente')
    await expect(boton(page, 'Declarar')).toBeFocused()
    await declarar(page, 12)
    await expect(mensaje(page)).toContainText('Declaración incorrecta')
    await expect(estadoPartida(page)).toHaveText('En curso')

    await lanzarDesde(page, 40)
    await expect(mensaje(page)).toContainText('La evidencia ya determina un único piso crítico')
    await declarar(page, 40)
    await expect(mensaje(page)).toContainText('¡Correcto! El piso crítico es 40')
    await expect(estadoPartida(page)).toHaveText('Resuelta')
    await expect(page.getByTestId('piso-critico')).toHaveText('40')
    await expect(boton(page, 'Lanzar')).toBeDisabled()
    await expect(boton(page, 'Declarar')).toBeDisabled()
  })

  test('CP-18: sin huevos y sin certeza la partida termina como no resuelta', async ({ page }) => {
    await iniciarPartida(page, 40)
    await lanzarDesde(page, 50)
    await lanzarDesde(page, 45)

    await expect(mensaje(page)).toContainText('Partida no resuelta')
    await expect(estadoPartida(page)).toHaveText('No resuelta')
    await expect(huevos(page)).toHaveText('0')
    await expect(page.getByTestId('piso-critico')).toHaveText('40')
    await expect(boton(page, 'Lanzar')).toBeDisabled()
    await expect(boton(page, 'Declarar')).toBeDisabled()
  })

  test('CP-17: reiniciar pide confirmación; cancelar o Escape conservan la partida y confirmar la restablece', async ({
    page,
  }) => {
    await iniciarPartida(page, 40)
    await lanzarDesde(page, 39)
    await lanzarDesde(page, 60)

    const confirmacion = page.getByRole('dialog', { name: '¿Reiniciar la partida?' })
    await boton(page, 'Reiniciar').click()
    await expect(confirmacion).toBeVisible()
    await confirmacion.getByRole('button', { name: 'Cancelar' }).click()
    await expect(confirmacion).toHaveCount(0)
    await expect(boton(page, 'Reiniciar')).toBeFocused()

    await boton(page, 'Reiniciar').click()
    await expect(confirmacion).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(confirmacion).toHaveCount(0)
    await expect(mensaje(page)).toContainText('Reinicio cancelado')
    await expect(boton(page, 'Reiniciar')).toBeFocused()
    await expect(intentos(page)).toHaveText('2')
    await expect(huevos(page)).toHaveText('1')
    await expect(pisosEn(page, 'seguro')).toHaveCount(39)

    await boton(page, 'Reiniciar').click()
    await confirmacion.getByRole('button', { name: 'Sí, reiniciar' }).click()
    await expect(intentos(page)).toHaveText('0')
    await expect(huevos(page)).toHaveText('2')
    await expect(filasHistorial(page)).toHaveCount(0)
    await expect(pisosEn(page, 'desconocido')).toHaveCount(100)
    await expect(estadoPartida(page)).toHaveText('En curso')
  })
})
