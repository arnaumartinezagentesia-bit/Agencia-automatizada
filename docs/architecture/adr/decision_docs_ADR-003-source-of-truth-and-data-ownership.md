# ADR-003 — Fuente de Verdad y Propiedad de Datos

- **Estado:** Aceptado
- **Fecha:** 2026-08-26

## Contexto
Es necesario definir dónde vive cada tipo de dato para evitar inconsistencias y errores peligrosos.

## Decisión
- PostgreSQL es la fuente de verdad de datos estructurados (órdenes, posiciones, balances, precios).
- Obsidian guarda solo conocimiento cualitativo (patrones, lecciones, reglas).
- Los datos históricos de mercado NO se guardan en Obsidian.
- El frontend nunca es fuente de verdad.

## Alternativas descartadas
- Usar Obsidian como base de datos transaccional (rechazado: lento, frágil, no determinista).

## Consecuencias
- Separación clara entre datos cuantitativos y conocimiento cualitativo.
- Backtesting fiable y reproducible.
