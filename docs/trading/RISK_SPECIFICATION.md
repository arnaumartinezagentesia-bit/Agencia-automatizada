# Especificación Cuantitativa y de Riesgo

> **Estado:** Aprobado
> **Fecha:** 2026-08-26
> **Regla de oro:** Toda regla que afecte a dinero, riesgo, posiciones, órdenes o resultados de backtesting debe implementarse como **lógica determinista, testeable y auditable**. Nunca como decisión producida por un LLM.

---

## 1. Parámetros de riesgo (no negociables)

| Parámetro | Valor | Tipo |
|---|---|---|
| Riesgo por operación | 1% del capital | Fijo, no cuestionable |
| Exposición total máxima | 10% del capital | Límite duro |
| Pérdida diaria máxima | 2% | Límite duro |
| Pérdida semanal máxima | 5% | Límite duro |
| Pérdida total (drawdown) | 10% | Detiene todo, requiere revisión manual |
| Posiciones simultáneas | 2 | Límite duro |
| Apalancamiento | 0 (prohibido) | Prohibido siempre |

## 2. Kill switch (parada de emergencia)

- **Manual:** el propietario puede detener toda orden nueva en cualquier momento.
- **Automático:** al alcanzar la pérdida diaria (2%), el sistema **bloquea toda operación nueva hasta el día siguiente** (no solo avisa).
- Al alcanzar el drawdown total (10%), se detiene todo y se requiere revisión manual antes de reanudar.

## 3. Costes aplicados al backtest

Todos los siguientes costes se aplican de forma determinista:

- Comisión por operación.
- Spread.
- Slippage.

## 4. Estrategia inicial

- **No hay estrategia predefinida.** El motor de backtesting se construye primero; las estrategias se diseñan y validan posteriormente por el agente estratega.

## 5. Reglas de implementación

1. El motor de riesgo es **determinista**: mismas entradas → mismas salidas, siempre.
2. El guardián de riesgo valida **toda** operación contra estas reglas antes de cualquier ejecución.
3. El controlador de ejecución **no puede** ignorar el resultado del guardián de riesgo.
4. El agente analista puede proponer señales, pero **nunca** ejecutar.
5. El frontend refleja **siempre** el estado real del backend; ninguna animación o evento visual se interpreta como éxito operacional sin confirmación del backend.
