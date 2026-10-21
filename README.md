# EGG100 — Simulador del problema de los dos huevos

Simulador web educativo del problema de los dos huevos y los 100 pisos, construido con **React 19 + Vite**. El desarrollo sigue el **Modelo de Prototipos** definido en la ERS (EGG100/SRS v1.0):

| Prototipo | Alcance | Estado |
| --- | --- | --- |
| **V1 · Simulación básica** | RF-01 a RF-05 y RF-17 a RF-20 | Implementado |
| V2 · Estrategias | RF-06 a RF-10 y RF-21 | Interfaz lista; lógica pendiente |
| V3 · Optimización | RF-11 a RF-16 | Pendiente |

## Requisitos previos

- Node.js 22.12 o superior (recomendado 24 LTS) y npm.

## Comandos

```bash
npm install                       # instala dependencias
npm run dev                       # servidor de desarrollo en http://localhost:5173
npm test                          # pruebas unitarias del dominio (Vitest)
npm run lint                      # análisis estático (Oxlint)
npm run build                     # build de producción en dist/
npx playwright install chromium   # solo la primera vez
npm run test:e2e                  # pruebas E2E en el navegador (Playwright)
```

## Estructura

```
src/
├── dominio/        # Reglas del juego en clases JS puras (sin React) y sus pruebas *.test.js
├── hooks/          # usePartida: conecta la clase Partida con React
├── componentes/    # Interfaz: pantallas, torre, paneles, diálogos y mensajes
├── prototipo.js    # Versión visible del prototipo (V2)
├── App.jsx         # Pestañas de modo: lanzamiento manual o ejecución de estrategias
└── main.jsx
tests/e2e/          # Pruebas Playwright nombradas por caso de prueba (CP-xx)
.github/workflows/  # CI: lint, pruebas unitarias, build y E2E
```

La lógica vive en `src/dominio` y no depende de React: se prueba de forma aislada y se reutilizará en V2 (estrategias automáticas) y V3 (análisis de los 100 escenarios).

## Clases del dominio

| Clase / módulo | Archivo | Responsabilidad | Requisitos |
| --- | --- | --- | --- |
| `Edificio` | `src/dominio/Edificio.js` | Pisos 1–100 y validación del piso elegido | RF-01, RF-02, RN-01 |
| `ControlHuevos` | `src/dominio/ControlHuevos.js` | Huevos disponibles; un huevo roto no se reutiliza | RF-04, RN-03 |
| `Lanzamiento`, `determinarResultado` | `src/dominio/Lanzamiento.js` | Regla de rotura (se rompe si piso ≥ F) y registro inmutable de un intento | RF-03, RF-05, RN-02 |
| `Historial` | `src/dominio/Historial.js` | Intentos contabilizados, numerados sin omisiones ni duplicados | RF-05, RF-20 |
| `RegistroInferencias` | `src/dominio/RegistroInferencias.js` | Pisos seguros, de rotura o desconocidos; redundancia y candidatos a F | RF-19, RF-20, RN-08 a RN-10 |
| `generarPisoCriticoAleatorio` | `src/dominio/generarPisoCritico.js` | F aleatorio en [1, 100] | RN-07 |
| `Partida` | `src/dominio/Partida.js` | Coordina iniciar, reiniciar, lanzar, declarar y el fin de partida | RF-17, RF-18, RN-11, RN-12 |

## Trazabilidad de V1

| Requisito | Caso de uso | Implementación | Prueba |
| --- | --- | --- | --- |
| RF-01 Visualización del edificio | CU-02 | `Edificio`, `TorreEdificio` | CP-01: `Edificio.test.js`, E2E |
| RF-02 Selección del piso | CU-01 | `Edificio.interpretarPiso`, `ControlesLanzamiento` | CP-02: `Edificio.test.js`, `Partida.test.js`, E2E |
| RF-03 Simulación del lanzamiento | CU-01 | `determinarResultado`, `Partida.lanzar` | CP-03: `Partida.test.js` (todos los F y pisos), E2E |
| RF-04 Control de huevos | CU-01, CU-02 | `ControlHuevos`, `PanelEstado` | CP-04: `ControlHuevos.test.js`, `Partida.test.js`, E2E |
| RF-05 Contador de lanzamientos | CU-01, CU-02 | `Historial`, `Partida.intentos` | CP-05: `Partida.test.js`, E2E |
| RF-17 Iniciar y reiniciar | CU-09 | `Partida.iniciar` / `reiniciar`, `DialogoConfirmacion` | CP-17: `Partida.test.js`, E2E |
| RF-18 Declarar y finalizar | CU-10 | `Partida.declarar`, `DialogoDeclarar`, `mensajes.js` | CP-18: `Partida.test.js`, E2E |
| RF-19 Información inferida | CU-11 | `RegistroInferencias`, `TorreEdificio`, `Leyenda` | CP-19: `RegistroInferencias.test.js`, E2E |
| RF-20 Evitar intentos redundantes | CU-11 | `RegistroInferencias.esRedundante`, `Partida.lanzar` | CP-20: `Partida.test.js`, E2E |

## Decisiones de V1 por validar con el cliente

- **Declarar sin evidencia no revela F.** Mientras la evidencia admita varios pisos, la respuesta es «no hay evidencia suficiente», coincida o no con F. El diagrama D4 compara primero con F, lo que permitiría descubrirlo declarando al azar.
- **Fin automático sin huevos.** Si se rompe el último huevo sin certeza, la partida termina como no resuelta (RN-11) y se muestra F.
- **Sin huevos pero con certeza**, se bloquean los lanzamientos y se puede declarar.
- **Reiniciar** pide confirmación mientras la partida está en curso (RN-12); una partida terminada se reinicia directamente.
- **Piso 100 tras sobrevivir en el 99.** La evidencia ya determina F = 100 y se puede declarar, pero el piso 100 sigue gris y lanzar desde él cuenta como intento, porque RN-08 solo marca lo que se deduce directamente de cada lanzamiento. Si RN-09 se interpreta en sentido amplio, ese lanzamiento debería bloquearse como redundante.

## V2: interfaz lista, lógica pendiente

La interfaz de V2 (RF-06, RF-07, RF-09 y RF-10) ya está construida: pestaña «Ejecución de estrategias», selección de estrategia, campo del piso crítico, historial y comparación. La lógica todavía no está conectada, así que «Ejecutar» aún no hace nada y el piso crítico elegido al iniciar no se aplica.

Cada punto donde falta lógica tiene un comentario `LÓGICA (RF-xx)` que explica qué debe hacer y qué datos espera la interfaz. Para encontrarlos:

```bash
grep -rn "LÓGICA" src
```
