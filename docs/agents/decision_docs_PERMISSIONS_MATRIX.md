# Matriz de Permisos y Aprobación Humana

> **Estado:** Aprobado
> **Fecha:** 2026-08-26

## 1. Acciones autónomas (sin aprobación humana)

| Acción | Autónoma |
|---|---:|
| Analizar datos de mercado | Sí |
| Ejecutar backtests | Sí |
| Generar hipótesis e informes | Sí |
| Escribir lecciones en memoria | Sí |
| Activar paper trading | Sí |

## 2. Acciones que requieren SIEMPRE aprobación humana

| Acción | Aprobación humana |
|---|---:|
| Conectar credenciales de bróker | Sí |
| Enviar órdenes reales | Sí |
| Cambiar parámetros de riesgo | Sí (con consentimiento explícito) |
| Instalar dependencias nuevas | Sí |
| Activar skills archivadas | Sí + ADR |
| Desplegar a producción | Sí |

## 3. Transición paper trading → ejecución real

- Requiere **siempre** aprobación explícita del propietario.
- Nunca automática.

## 4. Principios

1. La autonomía se limita a acciones informativas, de análisis y de simulación.
2. Toda acción que implique dinero real, credenciales, riesgo o despliegue exige aprobación humana.
3. El sintetizador de EAs (fase futura) operará bajo estas mismas reglas: ejecución real solo con aprobación explícita.
