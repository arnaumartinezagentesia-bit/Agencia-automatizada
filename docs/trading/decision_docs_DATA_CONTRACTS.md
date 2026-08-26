# Contratos de Dominio y Fuentes de Verdad

> **Estado:** Aprobado
> **Fecha:** 2026-08-26

## 1. Fuente de verdad por dominio

| Dominio | Fuente de verdad |
|---|---|
| Usuarios, permisos y configuración | PostgreSQL |
| Órdenes, posiciones, balances y ejecuciones | PostgreSQL + registro de eventos auditable |
| Precios y velas de mercado | Proveedor de datos + almacenamiento histórico local (PostgreSQL/Parquet/CSV) |
| Estado en tiempo real de la interfaz | Backend autoritativo vía WebSocket |
| Memoria cualitativa de agentes | Bóveda de Obsidian |
| Logs sin curar de agentes | `obsidian_vault/99_raw_logs/` |
| Secretos y claves | Variables de entorno / gestor de secretos. **Nunca** en Obsidian ni en el repositorio |

## 2. Prohibiciones explícitas

- **Obsidian NO es** base de datos transaccional de trading.
- **El frontend NO es** fuente de verdad de posiciones, órdenes o balances.
- **Los datos históricos de mercado NO se guardan en Obsidian.** Obsidian guarda el conocimiento cualitativo (patrones, reglas, lecciones).

## 3. Contrato de eventos en tiempo real

- El frontend se conecta al backend vía WebSocket.
- Tras reconectar, el frontend debe recuperar un **snapshot autoritativo** del backend (reconciliación).
- Ninguna operación se muestra como completada sin confirmación del backend.
- Estados visuales obligatorios: conectado, desconectado, reconectando, cargando, error, datos retrasados, modo backtest, modo paper, modo real.

## 4. Diferenciación visual obligatoria

- Backtest, paper trading y dinero real deben diferenciarse visualmente de forma inequívoca.
- El frontend muestra siempre el estado real del backend.
