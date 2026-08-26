# ADR-002 — Motor de Riesgo Determinista

- **Estado:** Aceptado
- **Fecha:** 2026-08-26

## Contexto
El principio de "Preservación de Capital" exige que las decisiones de dinero sean fiables y auditables.

## Decisión
Toda regla que afecte a dinero, riesgo, posiciones, órdenes o resultados de backtesting se implementa como **lógica determinista, testeable y auditable**. Los LLM se limitan a razonamiento heurístico y nunca toman decisiones de dinero.

## Alternativas descartadas
- Permitir que los LLM tomen decisiones de riesgo (rechazado: no determinista, no auditable).

## Consecuencias
- El guardián de riesgo es determinista.
- El controlador de ejecución no puede ignorar su resultado.
