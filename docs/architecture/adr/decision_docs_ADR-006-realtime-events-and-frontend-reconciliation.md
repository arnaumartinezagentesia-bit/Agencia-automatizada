# ADR-006 — Eventos en Tiempo Real y Reconciliación del Frontend

- **Estado:** Aceptado
- **Fecha:** 2026-08-26

## Contexto
El frontend Pixel Art usa WebSockets; es necesario garantizar que refleje siempre la realidad del backend.

## Decisión
- El backend es autoritativo vía WebSocket.
- Tras reconectar, el frontend recupera un snapshot autoritativo.
- Ninguna operación se muestra como completada sin confirmación del backend.
- Diferenciación visual obligatoria entre backtest, paper y real.

## Alternativas descartadas
- Frontend como fuente de verdad (rechazado).

## Consecuencias
- Interfaz fiable y sin falsos estados de éxito.
