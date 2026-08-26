# ADR-007 — Entornos y Límites de Despliegue

- **Estado:** Aceptado
- **Fecha:** 2026-08-26

## Contexto
Es necesario definir entornos y límites de despliegue.

## Decisión
- Tres entornos: local, staging, production.
- Proveedor: Hostinger.
- Curación nocturna en el mismo servidor que el backend.
- Despliegue a producción requiere aprobación humana.

## Alternativas descartadas
- Un solo entorno (rechazado: riesgo de romper producción).

## Consecuencias
- Flujo de validación claro antes de producción.
