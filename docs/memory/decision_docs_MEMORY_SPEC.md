# Especificación de Memoria Viva

> **Estado:** Aprobado
> **Fecha:** 2026-08-26

## 1. Estructura

- Bóveda única de Obsidian (`./obsidian_vault`) segmentada por departamentos.
- Captura en bruto JSON en `99_raw_logs/`.
- Curación por Cron Job nocturno.

## 2. Esquema JSON mínimo para `99_raw_logs/`

Campos obligatorios:

- `id` — identificador único.
- `timestamp` — marca temporal.
- `agent` — agente emisor.
- `source` — fuente de la observación.
- `action` — acción realizada.
- `result` — resultado.
- `confidence` — nivel de confianza (0-1).
- `token_cost` — coste estimado de tokens.
- `errors` — errores encontrados.
- `references` — referencias.

## 3. Promoción de log bruto a lección curada

- Solo el **curador de memoria** puede promover una observación a lección curada.
- El propietario también puede promover lecciones manualmente.
- La curación nocturna revisa los logs y promueve las observaciones válidas.

## 4. Contradicciones entre lecciones

- **No se resuelven automáticamente.**
- Cuando dos lecciones se contradicen, se marcan como **conflicto pendiente**.
- Se conservan ambas con sus metadatos.
- Se programan para revisión en la curación nocturna o manual.
- Nunca se pierde información; la contradicción queda visible.

## 5. Caducidad y revisión

- Revisión periódica del conocimiento **cada mes**.
- Las lecciones obsoletas o superadas se marcan y se archivan.

## 6. Información que NUNCA entra en Obsidian

- Secretos y credenciales.
- Datos sensibles de usuarios.
- Estado transaccional crítico (órdenes, balances).

## 7. Recuperación

- Si la curación nocturna falla, se registra el fallo y se alerta.
- La curación se reintenta en la siguiente ventana.
- Los logs brutos nunca se eliminan automáticamente sin curación previa.
