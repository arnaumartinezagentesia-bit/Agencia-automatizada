# Entornos y Estrategia de Despliegue

> **Estado:** Aprobado
> **Fecha:** 2026-08-26

## 1. Entornos

| Entorno | Propósito |
|---|---|
| local | Desarrollo individual, pruebas rápidas, sin datos reales |
| staging | Integración completa, paper trading, datos de prueba |
| production | Servicio 24/7, agentes operando en paper trading (y EAs en el futuro) |

## 2. Proveedor

- **Hostinger** como proveedor de hosting para producción.

## 3. Infraestructura

- **PostgreSQL:** a decidir en fase de implementación (Docker local o servicio gestionado).
- **Curación nocturna:** en el mismo servidor que el backend, como proceso separado (Cron Job).
- **Bóveda de Obsidian:** persistida y respaldada.
- **Backups y restauración:** definidos en la fase de despliegue.

## 4. Alertas

Se deben implementar alertas para:

- Caída del backend.
- Fallo de curación nocturna.
- Datos de mercado ausentes.
- Límite de riesgo alcanzado.
- Pérdida de conexión WebSocket.

## 5. Reglas

- Claude Code no elige proveedor de infraestructura ni gasta recursos sin aprobación.
- El despliegue a producción requiere siempre aprobación humana.
