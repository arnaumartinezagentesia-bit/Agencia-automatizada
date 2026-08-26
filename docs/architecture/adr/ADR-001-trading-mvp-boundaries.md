# ADR-001 — Límites del Trading MVP

- **Estado:** Aceptado
- **Fecha:** 2026-08-26

## Contexto
El proyecto busca un equipo de agentes de trading tipo "Wall Street" y, en el futuro, un sintetizador de EAs. Es necesario delimitar qué se construye primero.

## Decisión
El MVP se limita al **equipo analista** (noticias, estrategias backtesteadas, lectura de mercado) + motor de backtesting determinista + paper trading. El **sintetizador de EAs** y la ejecución real quedan para fases posteriores.

## Alternativas descartadas
- Construir el sintetizador de EAs en el MVP (rechazado: complejidad y riesgo prematuros).

## Consecuencias
- MVP más acotado y validable.
- El sintetizador de EAs se construye solo tras validar el motor determinista.
