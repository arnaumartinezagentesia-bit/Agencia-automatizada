# ADR-004 — Permisos de Agentes y Aprobación Humana

- **Estado:** Aceptado
- **Fecha:** 2026-08-26

## Contexto
La agencia será autónoma en ciertos flujos, pero los límites deben ser explícitos.

## Decisión
- Autónomo: análisis, backtests, hipótesis, lecciones, paper trading.
- Requiere aprobación humana: credenciales de bróker, órdenes reales, parámetros de riesgo, dependencias, skills archivadas, despliegue a producción.
- La transición a ejecución real requiere siempre aprobación explícita.

## Alternativas descartadas
- Autonomía total (rechazado: riesgo inaceptable).

## Consecuencias
- Límites implementables y auditables.
