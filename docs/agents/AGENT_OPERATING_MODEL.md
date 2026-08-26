# Modelo Operativo de Agentes

> **Estado:** Aprobado
> **Fecha:** 2026-08-26

## 1. Equipo de agentes del MVP

| Agente | Responsabilidad |
|---|---|
| Analista de noticias | Proporciona noticias relevantes de los mercados trabajados |
| Estratega de backtesting | Diseña y valida estrategias rentables de forma determinista |
| Lector de mercado | Analiza el mercado y simplifica su lectura |
| Guardián de riesgo | Valida determinísticamente toda operación contra las reglas |
| Controlador de ejecución | Gestiona órdenes (paper trading en el MVP) |
| Curador de memoria | Cura la bóveda de Obsidian |

## 2. Contrato por agente

Cada agente debe definir:

- Objetivo.
- Entradas autorizadas.
- Salidas esperadas.
- Herramientas que puede usar.
- Datos a los que puede acceder.
- Datos que nunca puede modificar.
- Presupuesto de tokens por ejecución.
- Tiempo máximo de ejecución.
- Condiciones de reintento.
- Condiciones de escalado a humano.
- Formato de su recibo de decisión.
- Qué lección puede escribir en memoria y bajo qué nivel de confianza.

## 3. Recibo de decisión

- **Obligatorio para todos los agentes**, siempre.
- Contiene: decisión, datos usados, confianza, coste de tokens, errores, referencias.

## 4. Presupuesto de tokens por ejecución

| Agente | Presupuesto |
|---|---|
| Analista de noticias | ~2.000 tokens |
| Estratega de backtesting | ~4.000 tokens |
| Lector de mercado | ~3.000 tokens |
| Guardián de riesgo | ~1.500 tokens |
| Curador de memoria | ~2.500 tokens |
| Controlador de ejecución | ~1.500 tokens |

- Límites **blandos**: si se superan, se registra y se avisa; no se corta en seco.
- Objetivo: visibilidad y control de costes.

## 5. Separación de responsabilidades

- El analista puede proponer señales, pero **nunca** ejecutar.
- El guardián de riesgo valida **toda** operación de forma determinista.
- El controlador de ejecución **no puede** ignorar el resultado del guardián de riesgo.
- El sintetizador de EAs (fase futura) operará bajo las mismas reglas de separación.
