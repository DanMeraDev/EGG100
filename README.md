# EGG100 — Simulador del problema de los dos huevos y cien pisos

Proyecto de **Metodologías Ágiles (EPN, 2026-B)** para demostrar el **Modelo de Prototipos**:
el simulador evoluciona en tres versiones a partir del análisis de requisitos, las evaluaciones con usuarios y las mejoras.

**Reto:** encontrar el piso crítico de un edificio de 100 pisos con dos huevos; la estrategia óptima garantiza
encontrarlo en un máximo de **14 lanzamientos** en el peor caso.

## Prototipos

| Versión | Enfoque | Requisitos |
|---|---|---|
| V1 — Simulación básica | Edificio, lanzamiento manual, huevos e intentos, inicio/reinicio, declaración, pisos inferidos | RF-01 a RF-05, RF-17 a RF-20 |
| V2 — Estrategias | Piso crítico configurable, secuencial y saltos de 10, historial, comparación | RF-06 a RF-10, RF-21 |
| V3 — Optimización | Estrategia óptima, análisis del peor caso, explicación de los 14 lanzamientos | RF-11 a RF-16, RNF-01 a RNF-03 |

Cada versión corresponde a un **milestone**. El trabajo se gestiona con **GitHub Issues** y el [tablero del proyecto](https://github.com/users/DanMeraDev/projects/4).

## Equipo y herramientas

| Rol | Herramienta |
|---|---|
| 1. Coordinación | GitHub Issues |
| 2. Análisis de requisitos | ReqView |
| 3. Diseño | Microsoft Visio |
| 4. Desarrollo frontend | Antigravity |
| 5. Desarrollo funcional | Antigravity |
| 6. Pruebas | Playwright + GitHub Actions |

## Flujo de trabajo

1. Cada requisito de la SRS tiene un Issue (`requisito`) con su criterio de aceptación y caso de prueba (CP-xx).
2. Las observaciones de las evaluaciones con usuarios se registran como Issue `observación-usuario`;
   si generan un cambio aprobado, se abre un Issue `cambio` con la plantilla de la SRS (§14.3, SRS-135).
3. Trabajar en una rama por Issue y abrir un PR con `Closes #N` para que el Issue se cierre al integrar.
4. QA enlaza el resultado de la prueba en el Issue antes de cerrarlo.

## Código actual

Interfaz JavaFX (`src/ui`) con las tres pantallas del diseño. La guía para conectar la lógica está en
[`docs/guia-logica.md`](docs/guia-logica.md).
