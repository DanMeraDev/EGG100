# Guía para implementar la lógica de EGG100

## 1. Objetivo y alcance

La interfaz JavaFX existente presenta tres pantallas:

1. `MainWindow`: selección de estrategia y controles iniciales.
2. `StrategyExecutionWindow`: edificio de 100 pisos y botón **Revisar resultados**.
3. `AnalysisResultsWindow`: secuencia y comparación de estrategias.

Esta guía define cómo conectar la lógica futura a esas pantallas sin mezclar reglas del simulador con presentación. No cambia el diseño de la interfaz ni especifica todavía el código de los algoritmos.

## 2. Estructura sugerida

Conservar `App` y `ui`. Incorporar los paquetes de modelo y lógica:

```text
src/
├── App.java
├── ui/
│   ├── MainWindow.java
│   ├── StrategyExecutionWindow.java
│   ├── AnalysisResultsWindow.java
│   └── FloorState.java
├── model/
│   ├── GameState.java
│   ├── FloorStatus.java
│   ├── Attempt.java
│   ├── StrategyType.java
│   └── StrategyResult.java
└── service/
    ├── SimulationService.java
    ├── Strategy.java
    ├── SequentialStrategy.java
    ├── FixedJumpStrategy.java
    └── OptimalStrategy.java