import { describe, expect, it } from 'vitest'
import { RESULTADO } from './Lanzamiento.js'
import { ESTADO_PISO, RegistroInferencias } from './RegistroInferencias.js'

const { SEGURO, ROTURA, DESCONOCIDO } = ESTADO_PISO

function estados(registro, desde, hasta) {
  const resultado = new Set()
  for (let piso = desde; piso <= hasta; piso += 1) {
    resultado.add(registro.estadoDe(piso))
  }
  return [...resultado]
}

describe('RegistroInferencias (RF-19, RF-20, RN-08 a RN-10)', () => {
  it('sin lanzamientos todo es desconocido y F puede estar entre 1 y 100', () => {
    const registro = new RegistroInferencias()
    expect(estados(registro, 1, 100)).toEqual([DESCONOCIDO])
    expect(registro.candidatos).toEqual({ desde: 1, hasta: 100 })
    expect(registro.pisoDeterminado).toBeNull()
  })

  it('si sobrevive en x, solo los pisos 1..x pasan a seguros (CP-19)', () => {
    const registro = new RegistroInferencias()
    registro.registrar(30, RESULTADO.SOBREVIVE)
    expect(estados(registro, 1, 30)).toEqual([SEGURO])
    expect(estados(registro, 31, 100)).toEqual([DESCONOCIDO])
  })

  it('si se rompe en x, solo los pisos x..100 pasan a rotura (CP-19)', () => {
    const registro = new RegistroInferencias()
    registro.registrar(60, RESULTADO.SE_ROMPE)
    expect(estados(registro, 1, 59)).toEqual([DESCONOCIDO])
    expect(estados(registro, 60, 100)).toEqual([ROTURA])
  })

  it('marca como redundantes solo los pisos con resultado conocido (CP-20)', () => {
    const registro = new RegistroInferencias()
    registro.registrar(30, RESULTADO.SOBREVIVE)
    registro.registrar(60, RESULTADO.SE_ROMPE)
    expect([1, 30, 60, 100].every((piso) => registro.esRedundante(piso))).toBe(true)
    expect([31, 45, 59].some((piso) => registro.esRedundante(piso))).toBe(false)
  })

  it('conserva el piso seguro más alto y la rotura más baja', () => {
    const registro = new RegistroInferencias()
    registro.registrar(20, RESULTADO.SOBREVIVE)
    registro.registrar(30, RESULTADO.SOBREVIVE)
    registro.registrar(80, RESULTADO.SE_ROMPE)
    registro.registrar(60, RESULTADO.SE_ROMPE)
    expect([registro.maxSeguro, registro.minRotura]).toEqual([30, 60])
    expect(registro.candidatos).toEqual({ desde: 31, hasta: 60 })
  })

  it('determina F cuando la evidencia deja un solo candidato (RN-10)', () => {
    const registro = new RegistroInferencias()
    registro.registrar(39, RESULTADO.SOBREVIVE)
    registro.registrar(40, RESULTADO.SE_ROMPE)
    expect(registro.pisoDeterminado).toBe(40)
  })

  it('con rotura en el piso 1, F = 1 y el piso seguro máximo es 0', () => {
    const registro = new RegistroInferencias()
    registro.registrar(1, RESULTADO.SE_ROMPE)
    expect(registro.maxSeguro).toBe(0)
    expect(registro.pisoDeterminado).toBe(1)
  })

  it('si sobrevive en 99, F = 100 aunque el piso 100 siga sin colorear', () => {
    const registro = new RegistroInferencias()
    registro.registrar(99, RESULTADO.SOBREVIVE)
    expect(registro.pisoDeterminado).toBe(100)
    expect(registro.estadoDe(100)).toBe(DESCONOCIDO)
  })
})
