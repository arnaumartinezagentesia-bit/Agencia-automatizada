# Decisiones y Supuestos del MVP — Agencia Automatizada

Este documento recoge todas las decisiones cerradas y los supuestos validados para el MVP de la Agencia Automatizada. Claude Code y cualquier colaborador deben leer este archivo antes de comenzar cualquier tarea de desarrollo, junto con la documentación arquitectónica y los ADR.

> **Estado:** Documento vivo. Se actualiza cada vez que se cierra una nueva decisión o se modifica un supuesto. Última actualización: 2026-08-27.

---

## 1. Datos de mercado

### 1.1 Fuente de datos
- **Datos de precios (OHLC):** Se obtendrán desde cero, preferiblemente mediante descarga desde MT5 o APIs públicas gratuitas de datos históricos de metales. No se utilizarán datos simulados como fuente de mercado.
- **Conocimiento cualitativo:** Papers, cartas de brokers, noticias y análisis de traders se almacenarán en Obsidian y alimentarán a los agentes analíticos. Son complementarios a los datos de precios, no sustitutos.
- **Registro obligatorio:** Para cada conjunto de datos de precios se documentará: fuente, instrumento, timeframe, zona horaria, periodo cubierto, formato, calidad conocida, huecos o anomalías, y si incluye spread.

### 1.2 Timeframes
- **Base visual y de análisis:** M15 como timeframe principal, con H1 como contexto de fondo.
- **Flexibilidad:** Se utilizarán todos los timeframes necesarios según la estrategia. El sistema debe soportar múltiples timeframes simultáneamente.

### 1.3 Spread
- Pendiente de verificar en los datos obtenidos. Si los datos no incluyen spread, se añadirá un spread fijo conservador en el backtesting y paper trading.

### 1.4 Periodo histórico
- **Mínimo:** 3 años de datos históricos.
- **Óptimo:** 5 años.
- Menos de 3 años no se considera suficiente para el MVP.

### 1.5 Modo de datos
- **Fase inicial:** Solo datos históricos.
- **Fase posterior:** Datos en tiempo real, una vez validado el núcleo con datos históricos.

### 1.6 Obtención
- Los datos deben obtenerse desde cero. No existen datos preexistentes en el repositorio.

---

## 2. Evaluación de estrategias

### 2.1 Número mínimo de operaciones
- **Mínimo aceptable:** 100 operaciones.
- **Mínimo recomendado:** 200–300 operaciones.
- Estrategias con menos de 100 operaciones se marcan como `backtest_candidate` pero no pasan a `validated_for_paper`.

### 2.2 Drawdown máximo en backtest
- **Límite:** 15%.
- Estrategias con drawdown superior al 15% en backtest se rechazan automáticamente.

### 2.3 Validación fuera de muestra
- **Obligatoria.** División de datos: 70% entrenamiento / 30% validación fuera de muestra.
- Una estrategia solo pasa a `validated_for_paper` si el resultado se mantiene razonable en el 30% de validación.
- "Razonable" se define como: métricas principales (profit factor, win rate, drawdown) no degradadas más de un 20% respecto al periodo de entrenamiento.

### 2.4 Métricas obligatorias en backtest
Todo resultado de backtest debe incluir, como mínimo:
- Beneficio neto.
- Win rate.
- Ratio beneficio/pérdida.
- Profit factor.
- Drawdown máximo.
- Número total de operaciones.
- Exposición media.
- Periodo de entrenamiento y periodo de validación.
- Benchmark comparativo.

### 2.5 Benchmark
- **Obligatorio.** Cada estrategia se compara contra un benchmark simple (comprar y mantener XAUUSD en el mismo periodo).
- Si la estrategia no supera al benchmark en el periodo fuera de muestra, no se considera validada.

### 2.6 Estados de estrategia
Los estados aprobados son:
- `hypothesis`
- `backtest_candidate`
- `validated_for_paper`
- `paper_observation`
- `rejected`
- `blocked_by_risk`

No se utilizará la etiqueta "rentable" sin validación completa.

---

## 3. Paper trading

### 3.1 Tipo de paper trading
- **Paper trading interno.** El sistema simula las órdenes él mismo.
- La cuenta demo del bróker queda reservada para una fase posterior.

### 3.2 Capital virtual
- **Capital inicial:** 1.000 EUR.
- Riesgo por operación: 1% = 10 EUR.

### 3.3 Horario
- El paper trading respeta el horario real del mercado de XAUUSD.
- No se ejecutan operaciones fuera de horario.

### 3.4 Historial de operaciones
Cada operación de paper trading registra:
- Fecha y hora.
- Dirección (compra/venta).
- Tamaño.
- Precio de entrada.
- Precio de salida.
- Resultado (EUR y %).
- Motivo de la entrada.
- Agente que la propuso.
- Estado de riesgo en el momento de la entrada.

### 3.5 Control manual
- El usuario puede pausar o detener el paper trading en cualquier momento desde la interfaz.
- La pausa no borra el historial ni el estado.

---

## 4. Criterios de éxito del MVP

El MVP se considera terminado cuando se cumplen **todos** los siguientes criterios:

1. El backend arranca de forma reproducible.
2. El frontend recibe y reconcilia snapshots del backend.
3. El motor de riesgo pasa todos los casos límite.
4. Una estrategia puede ejecutarse en un backtest reproducible.
5. Una propuesta bloqueada por riesgo no puede convertirse en orden.
6. El paper trading conserva un historial auditable.
7. Los datos simulados están identificados visualmente.
8. Los agentes generan resultados con contratos estructurados.
9. El sistema puede reiniciarse sin perder el estado persistente.
10. Las pruebas pasan en un entorno limpio.

### 4.1 Primer hito funcional
- **Flujo completo:** desde una noticia hasta una propuesta de estrategia validada.
- **Observación:** todos los agentes trabajan conjuntamente en ese flujo.

---

## 5. Aprobación humana

### 5.1 Acciones que requieren aprobación explícita
- Cambiar límites de riesgo.
- Activar una integración de ejecución.
- Cambiar de `backtest` a `paper`.
- Cambiar de `paper` a `real`.
- Modificar credenciales.
- Desplegar en producción.
- Activar una estrategia nueva para paper trading.
- Borrar datos o resultados históricos.

### 5.2 Excepciones
- Ninguna. Todas las acciones anteriores requieren aprobación.

### 5.3 Auditoría de intentos
- El sistema registra en un log de auditoría cada intento de acción que requiere aprobación, tanto si se aprueba como si se deniega.

---

## 6. Riesgo y límites

### 6.1 Límites definitivos del MVP
| Parámetro | Valor |
|---|---|
| Riesgo por operación | 1% |
| Pérdida diaria máxima | 2% |
| Pérdida semanal máxima | 5% |
| Drawdown total máximo | 10% |
| Máximo posiciones simultáneas | 2 |
| Máximo trades por día | 3 |
| Exposición máxima | 10% |
| Apalancamiento | 0 (no permitido) |

### 6.2 Kill switch diario
- Se activa automáticamente al alcanzar el límite diario (2%).
- Se desactiva **automáticamente** al cambiar de día.
- Bloquea nuevas operaciones mientras está activo.

### 6.3 Reinicio con kill switch activo
- Si el sistema se reinicia mientras el kill switch está activo, **permanece bloqueado** hasta que el usuario lo desactive manualmente.
- El reinicio no levanta el kill switch.

### 6.4 Alertas de riesgo
- Se envía alerta por **Telegram** y se muestra en la **interfaz** cuando:
  - Se activa el kill switch.
  - Se acerca a un límite diario, semanal o de drawdown.
  - Se alcanza el 80% de cualquier límite.

---

## 7. Memoria y conocimiento

### 7.1 Separación de almacenamiento
- **Obsidian:** Solo conocimiento cualitativo (lecciones, patrones, noticias curadas, papers).
- **PostgreSQL:** Datos de mercado, órdenes, posiciones, balances, resultados de backtest, auditoría.

### 7.2 Captura automática
- La memoria captura **todos** los resultados de backtest y operaciones de paper trading para el journal.
- No depende de la decisión del curador; la captura es automática y completa.

### 7.3 Conflictos pendientes
- Las lecciones contradictorias se conservan como **conflicto pendiente**.
- No se resuelven automáticamente por puntuación de confianza.
- Se revisan manualmente.

### 7.4 Clasificación de lecciones
Las lecciones se clasifican en tres categorías:
- **Lecciones de mercado:** Patrones, comportamientos del precio, contexto macro.
- **Lecciones de proceso:** Errores en flujos, mejoras en coordinación, problemas técnicos.
- **Lecciones de riesgo:** Violaciones de límites, near-misses, ajustes de parámetros.

---

## 8. Interfaz y experiencia

### 8.1 Pantallas imprescindibles
- Dashboard general.
- Noticias.
- Estrategias / Backtests.
- Lectura de mercado.
- Riesgo.
- Paper trading.
- Memoria.

### 8.2 Modo del sistema
- La interfaz muestra **siempre** el modo actual: `unconfigured`, `data_unavailable`, `backtest`, `paper`, `real`.
- El modo `real` no está disponible en el MVP.

### 8.3 Detalle del dashboard
- Muestra el **estado individual de cada agente**.
- Incluye estado, última acción, errores y resultados recientes.

### 8.4 Transparencia de datos
- Las noticias y análisis muestran **fuente y fecha**.
- Los datos simulados se distinguen **visualmente** de los reales.

---

## 9. Entorno y despliegue

### 9.1 Separación de entornos
- **Local:** Desarrollo y pruebas.
- **Staging:** Validación pre-producción.
- **Producción:** Operación 24/7 (reservada para post-MVP).

### 9.2 Alojamiento
- **Staging y producción:** Hostinger.
- **Local:** Docker en máquina de desarrollo.

### 9.3 Despliegue progresivo
- El MVP se despliega primero solo en local y staging.
- Producción queda reservada hasta que el sistema esté validado.

### 9.4 Copias de seguridad
- **Obligatorias desde el principio.**
- Backups automáticos de PostgreSQL en staging y producción.
- Restauración verificada periódicamente.

---

## 10. Alcance y prioridades

### 10.1 Instrumento
- **MVP:** Solo `XAUUSD`.
- Otros activos quedan para fases posteriores.

### 10.2 Funcionalidades fuera del MVP
- Sintetizador de EAs.
- Ejecución real con dinero.
- Recomendaciones de inversión sobre empresas u otros activos.
- Soporte multiactivo.
- Acceso multiusuario.

### 10.3 Prioridad número uno
- **Flujo completo:** noticia → análisis → hipótesis → backtest → propuesta de estrategia.
- Observación de la colaboración entre agentes en ese flujo.

---

## 11. Modelo de operación jerárquica

### 11.1 Estructura
La agencia opera con una jerarquía de tres niveles:

1. **Director General:** Recibe las peticiones del usuario, distribuye el trabajo a las oficinas, revisa los resultados finales y los envía al usuario.
2. **Directores de Oficina:** Reciben tareas del Director General o directamente del usuario (si la tarea pertenece a su oficina), asignan trabajo a los agentes de su oficina, revisan los resultados y los escalan.
3. **Agentes:** Ejecutan las tareas asignadas, pueden interactuar entre sí para colaborar, y reportan a su director de oficina.

### 11.2 Flujo de comunicación
- **Usuario → Director General → Director de Oficina → Agentes → Director de Oficina → Director General → Usuario.**
- **Usuario → Agente individual → Director de Oficina → (si pertenece a esa oficina) Agentes → Director de Oficina → Usuario o Director General.**
- **Usuario → Agente individual → Director de Oficina → (si NO pertenece) Director General → Otra Oficina → Agentes → Director de Oficina → Director General → Usuario.**
- **Agentes ↔ Agentes:** Interacción directa permitida para colaboración.

### 11.3 Comunicación formal entre niveles
- Los agentes se comunican con su director de oficina mediante mensajes normales.
- Los directores de oficina se comunican con el Director General mediante un canal formal (metáfora: "llamada telefónica").
- Esta distinción debe reflejarse visualmente en el frontend.

### 11.4 Visualización en el frontend
- El frontend debe mostrar:
  - Conversaciones entre agentes.
  - Interacciones agente ↔ director de oficina.
  - Llamadas formales director de oficina ↔ Director General.
  - Estado individual de cada agente y director.
  - Errores, resultados y progreso de cada tarea.

### 11.5 Implicaciones de diseño
- Este modelo jerárquico **añade una capa de orquestación** sobre los 6 roles funcionales definidos anteriormente.
- Los roles funcionales (analista, estratega, lector, riesgo, ejecución, memoria) se mapean a agentes dentro de las oficinas correspondientes.
- La oficina de riesgo tiene autoridad para bloquear cualquier propuesta, independientemente de la jerarquía.

---

## 12. Operación diaria

### 12.1 Rutina esperada
- El usuario interactúa principalmente con el Director General.
- Puede solicitar cualquier tipo de análisis, estrategia o información.
- El Director General distribuye, revisa y entrega resultados.
- El usuario también puede interactuar directamente con agentes individuales.
- El usuario puede revisar en cualquier momento: estados, errores, resultados, historial.

### 12.2 Alertas imprescindibles
- Kill switch activado.
- Límite diario, semanal o de drawdown cercano (≥80%).
- Estrategia validada para paper trading.
- Error de datos o caída del sistema.
- Cualquier evento que requiera actuación o presencia del usuario.
- Intento denegado de acción que requiere aprobación.

### 12.3 Resumen diario automático
- Generado al cierre de cada día de mercado.
- Enviado por Telegram y disponible en la interfaz.

### 12.4 Contenido del resumen diario
- Estado del sistema y modo actual.
- Resumen de noticias relevantes del día.
- Estrategias nuevas generadas y su estado.
- Resultados de backtests del día.
- Operaciones de paper trading del día.
- Estado de riesgo: límites consumidos, kill switch, near-misses.
- Errores o alertas del día.
- Lecciones capturadas en memoria.
- Todo con fecha y hora.

---

## 13. Decisiones pendientes

No quedan decisiones críticas pendientes para iniciar la Fase 0 de saneamiento y construcción del núcleo.

Las siguientes cuestiones se resolverán durante la construcción:

- Proveedor concreto de datos históricos de XAUUSD.
- Spread exacto a aplicar si los datos no lo incluyen.
- Definición precisa de "razonable" en la validación fuera de muestra (el 20% propuesto es un punto de partida).
- Mapeo exacto de roles funcionales a oficinas y agentes.
- Diseño visual de la comunicación jerárquica en el frontend.

---

## 14. Referencias cruzadas

Este documento debe leerse junto con:

- `docs/architecture/AGENCIA_MASTER_ARCHITECTURE_SPEC.md`
- `docs/architecture/AGENT_TOKEN_EFFICIENCY_POLICY.md`
- `docs/architecture/DEPLOYMENT_AND_TESTING_GUIDE.md`
- `docs/architecture/CLAUDE_CODE_MASTER_INSTRUCTION_PROMPT.md`
- `docs/product/PRD_TRADING_MVP.md`
- `docs/trading/RISK_SPECIFICATION.md`
- `docs/trading/DATA_CONTRACTS.md`
- `docs/agents/AGENT_OPERATING_MODEL.md`
- `docs/agents/PERMISSIONS_MATRIX.md`
- `docs/memory/MEMORY_SPEC.md`
- `docs/deployment/ENVIRONMENTS_AND_DEPLOYMENT.md`
- Todos los ADR en `docs/architecture/adr/`
- `README.md` (raíz)

---

*Documento generado el 2026-08-27. Las decisiones aquí recogidas son vinculantes para el MVP salvo actualización explícita.*
